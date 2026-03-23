import { GoogleGenAI } from '@google/genai'
import type {
  AiConversationContext,
  AiConversationResult,
  AiProvider,
  ToolCall,
} from './ai-provider'
import { financeFunctionDeclarations } from './gemini/declarations/finance-tools'

const model = 'gemini-2.5-flash'

type GenPart =
  | { text: string }
  | { functionCall: { name: string; args?: Record<string, unknown> } }
  | {
      functionResponse: {
        name: string
        response: { result: unknown }
      }
    }

type GenContent = {
  role: 'user' | 'model'
  parts: GenPart[]
}

interface GeminiClient {
  models: {
    generateContent(args: any): Promise<{
      text?: string
      functionCalls?: Array<{ name?: string; args?: Record<string, unknown> }>
    }>
  }
}

function toGeminiContents(
  history: AiConversationContext['history'],
  userMessage: string
): GenContent[] {
  const contents: GenContent[] = history.map(item => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.content }],
  }))

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  })

  return contents
}

function nowIsoBrazilHint(): string {
  return new Date().toISOString()
}

function buildSystemContextPart(context: AiConversationContext): GenPart {
  return {
    text: [
      'Voce e o Robertinho, assistente financeiro com function calling.',
      'Use as ferramentas para executar operacoes no banco quando necessario.',
      'A data atual do sistema e ' + nowIsoBrazilHint() + '.',
      'Ao chamar funcoes com datas (parcelas e vencimentos), calcule data ISO absoluta correta no fuso horario do Brasil.',
      `ESTADO_ATUAL_DA_SESSAO: ${context.currentState ?? 'idle'}`,
      `DADOS_PENDENTES: ${JSON.stringify(context.pendingData ?? {})}`,
      'Sempre considere o historico da conversa antes de decidir a proxima acao.',
      'Se faltar informacao, faca pergunta objetiva ao usuario.',
      'Se houver dados suficientes, chame a ferramenta adequada.',
      'Voce e plenamente capaz de gerenciar parcelamentos.',
      'Se o usuario perguntar "quais compras parceladas eu tenho?", use get_all_remaining_installments.',
      'Se perguntar "quantas parcelas faltam da moto?", use get_remaining_installments passando nameExpense.',
      'Para total geral de despesas use get_sum_expenses.',
      'Para despesas fixas use get_sum_expenses_fixed.',
      'Para variaveis do mes anterior use get_sum_expenses_of_last_month_variables.',
      'Para contas em aberto no mes atual use get_unpaid_expenses_of_current_month.',
      'Para dar baixa em uma parcela especifica use pay_installment com nameExpense.',
      'Para quitar todas as contas em aberto do mes use pay_all_unpaid_current_month.',
      'Para desfazer pagamento de uma despesa use unpay_expense com nameExpense.',
      'Para contas ate o dia 15 use accounts_to_pay_by_day_fifteen.',
      'Para registrar receita use create_recipe com descricao e valor.',
      'Para painel consolidado da home use get_home_data.',
      `Voce agora gerencia o Google Agenda do usuario. Use create_calendar_event para compromissos e list_calendar_events para checar a agenda. A data/hora exata de agora e: ${new Date().toISOString()} (UTC-3). Nunca tente adivinhar compromissos, sempre chame a funcao list primeiro.`,
      '',
      'DIRETRIZES DE FORMATACAO VISUAL (UI/UX) - OBRIGATORIAS',
      'Nunca responda com texto seco ou lista crua ao relatar dados financeiros.',
      'Sempre responda como interface premium com recibos e dashboards legiveis.',
      'Use HTML do Telegram: <b>negrito</b> e <i>italico</i>.',
      'Valores monetarios e rotulos devem estar sempre em <b>negrito</b>.',
      'Use emojis contextuais obrigatoriamente em cada item (ex: ⚡ energia, 🚗 gasolina, 🛒 mercado, 💧 agua, 🏥 saude).',
      'Use linhas separadoras com --- para estruturar dashboards.',
      '',
      'Template 1 - Recibo de acao (criar/pagar/atualizar):',
      '✅ <i>Despesa Registrada!</i>',
      '🏷️ <b>Item:</b> Cuidados Medicos',
      '💰 <b>Valor:</b> R$ 348,00',
      '📅 <b>Data/Vencimento:</b> 05/04/2026',
      '',
      'Template 2 - Dashboard de resumo/listagem:',
      '📊 <i>Resumo de Abril/2026</i>',
      '---',
      '🛒 <b>Mercado:</b> R$ 250,00',
      '💧 <b>Agua:</b> R$ 40,00',
      '🏥 <b>Cuidados Medicos:</b> R$ 348,00',
      '---',
      '📉 <b>TOTAL A PAGAR:</b> R$ 2.216,33',
    ].join('\n'),
  }
}

export class GeminiAiProvider implements AiProvider {
  private readonly client: GeminiClient

  constructor(params?: { client?: GeminiClient; apiKey?: string }) {
    if (params?.client) {
      this.client = params.client
      return
    }

    const apiKey = params?.apiKey ?? process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is required to initialize GeminiAiProvider'
      )
    }

    this.client = new GoogleGenAI({ apiKey })
  }

  async generateReply(
    userMessage: string,
    context: AiConversationContext
  ): Promise<AiConversationResult> {
    const contents = toGeminiContents(context.history, userMessage)
    contents.unshift({ role: 'user', parts: [buildSystemContextPart(context)] })

    let response = await this.client.models.generateContent({
      model,
      contents,
      config: {
        tools: [{ functionDeclarations: financeFunctionDeclarations }],
      },
    })

    const nextHistory = [
      ...context.history,
      { role: 'user' as const, content: userMessage },
    ]

    let safetyCounter = 0
    while (response.functionCalls && response.functionCalls.length > 0) {
      safetyCounter += 1
      if (safetyCounter > 5) {
        break
      }

      const calls = response.functionCalls
      for (const rawCall of calls) {
        const call: ToolCall = {
          name: rawCall.name ?? '',
          args: rawCall.args ?? {},
        }

        const toolResult = await context.executeTool(call)

        contents.push({
          role: 'model',
          parts: [
            {
              functionCall: {
                name: call.name,
                args: call.args,
              },
            },
          ],
        })

        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: { result: toolResult },
              },
            },
          ],
        })

        nextHistory.push({
          role: 'assistant',
          content: `[functionCall] ${call.name}(${JSON.stringify(call.args)})`,
        })
        nextHistory.push({
          role: 'assistant',
          content: `[functionResponse] ${call.name}: ${JSON.stringify(toolResult)}`,
        })
      }

      response = await this.client.models.generateContent({
        model,
        contents,
        config: {
          tools: [{ functionDeclarations: financeFunctionDeclarations }],
        },
      })
    }

    const message = response.text?.trim() || 'Nao consegui responder agora.'
    nextHistory.push({ role: 'assistant', content: message })

    return {
      message,
      history: nextHistory.slice(-20),
    }
  }
}
