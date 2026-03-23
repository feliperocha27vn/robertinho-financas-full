import { GoogleGenAI, Type } from '@google/genai'
import type { AiProvider, ParsedAssistantCommand } from './ai-provider'

const model = 'gemini-2.5-flash'

const responseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: [
        'greeting',
        'pay_expenses',
        'update_expense',
        'update_expense_amount',
        'create_expense',
        'create_expense_installment',
        'create_new_recipe',
        'get_sum_expenses',
        'get_sum_expenses_fixed',
        'get_sum_expenses_of_month_variables',
        'get_sum_expenses_of_last_month_variables',
        'accounts_payable_next_month',
        'get_unpaid_expenses_of_current_month',
        'get_remaining_installments',
        'get_all_remaining_installments',
        'pay_installment',
        'pay_all_unpaid_current_month',
        'unpay_expense',
        'unknown',
      ],
    },
    description: { type: Type.STRING, nullable: true },
    amount: { type: Type.NUMBER, nullable: true },
    category: {
      type: Type.STRING,
      enum: ['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT'],
      nullable: true,
    },
    isFixed: { type: Type.BOOLEAN, nullable: true },
    numberOfInstallments: { type: Type.INTEGER, nullable: true },
    nameExpense: { type: Type.STRING, nullable: true },
    expenseName: { type: Type.STRING, nullable: true },
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      nullable: true,
    },
    firstDueDate: {
      type: Type.STRING,
      description: 'Data ISO 8601. Exemplo: 2026-04-15T00:00:00.000Z',
      nullable: true,
    },
    newValue: { type: Type.NUMBER, nullable: true },
  },
  required: ['intent'],
} as const

interface GeminiClient {
  models: {
    generateContent(args: {
      model: string
      contents: string
      config: {
        responseMimeType: 'application/json'
        responseJsonSchema: typeof responseJsonSchema
      }
    }): Promise<{ text?: string }>
  }
}

function safeJsonParse(text?: string): Record<string, unknown> {
  if (!text) {
    return { intent: 'unknown' }
  }

  try {
    return JSON.parse(text)
  } catch {
    return { intent: 'unknown' }
  }
}

function asParsedCommand(
  payload: Record<string, unknown>
): ParsedAssistantCommand {
  const allowedIntents = new Set<ParsedAssistantCommand['intent']>([
    'greeting',
    'pay_expenses',
    'update_expense',
    'update_expense_amount',
    'create_expense',
    'create_expense_installment',
    'create_new_recipe',
    'get_sum_expenses',
    'get_sum_expenses_fixed',
    'get_sum_expenses_of_month_variables',
    'get_sum_expenses_of_last_month_variables',
    'accounts_payable_next_month',
    'get_unpaid_expenses_of_current_month',
    'get_remaining_installments',
    'get_all_remaining_installments',
    'pay_installment',
    'pay_all_unpaid_current_month',
    'unpay_expense',
    'unknown',
  ])

  const intent =
    typeof payload.intent === 'string' &&
    allowedIntents.has(payload.intent as ParsedAssistantCommand['intent'])
      ? (payload.intent as ParsedAssistantCommand['intent'])
      : 'unknown'

  const firstDueDate =
    typeof payload.firstDueDate === 'string' && payload.firstDueDate.length > 0
      ? new Date(payload.firstDueDate)
      : undefined

  const amount =
    typeof payload.amount === 'number'
      ? payload.amount
      : typeof payload.amount === 'string'
        ? Number(payload.amount.replace(',', '.'))
        : undefined

  const newValue =
    typeof payload.newValue === 'number'
      ? payload.newValue
      : typeof payload.newValue === 'string'
        ? Number(payload.newValue.replace(',', '.'))
        : undefined

  const normalizedUpdateIntent =
    intent === 'update_expense_amount' ? 'update_expense' : intent

  const nameExpense =
    typeof payload.expenseName === 'string'
      ? payload.expenseName
      : typeof payload.nameExpense === 'string'
        ? payload.nameExpense
        : normalizedUpdateIntent === 'update_expense' &&
            typeof payload.description === 'string'
          ? payload.description
          : undefined

  return {
    intent: normalizedUpdateIntent,
    description:
      typeof payload.description === 'string' ? payload.description : undefined,
    amount: amount !== undefined && !Number.isNaN(amount) ? amount : undefined,
    category:
      payload.category === 'TRANSPORT' ||
      payload.category === 'OTHERS' ||
      payload.category === 'STUDIES' ||
      payload.category === 'RESIDENCE' ||
      payload.category === 'CREDIT'
        ? payload.category
        : undefined,
    isFixed: typeof payload.isFixed === 'boolean' ? payload.isFixed : undefined,
    numberOfInstallments:
      typeof payload.numberOfInstallments === 'number'
        ? payload.numberOfInstallments
        : undefined,
    nameExpense,
    expenseName: nameExpense,
    items: Array.isArray(payload.items)
      ? payload.items.filter((item): item is string => typeof item === 'string')
      : undefined,
    newValue:
      newValue !== undefined && !Number.isNaN(newValue) ? newValue : undefined,
    firstDueDate:
      firstDueDate && !Number.isNaN(firstDueDate.getTime())
        ? firstDueDate
        : undefined,
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

  async parseMessage(
    input: string,
    currentState: string = 'idle'
  ): Promise<ParsedAssistantCommand> {
    const prompt = [
      'Voce eh um extrator de intencao e entidades para um assistente financeiro pessoal.',
      `Estado atual da conversa: ${currentState}.`,
      'Retorne APENAS JSON valido no schema solicitado.',
      'Nao invente valores. Quando nao houver informacao, retorne null ou unknown.',
      'REGRAS DE DECISAO DE INTENCAO (PRIORIDADE ALTA):',
      '- Se o usuario pedir para mudar/alterar/atualizar o valor de uma despesa existente, use update_expense.',
      '- Nesses casos, NAO use create_expense.',
      '- Em update_expense, preencha obrigatoriamente expenseName e newValue.',
      'REGRA OBRIGATORIA: quando a intencao for pay_expenses, o campo items DEVE conter os nomes das contas mencionadas.',
      'Sempre que o usuario demonstrar pagar, quitar, dar baixa ou acertar uma conta, extraia obrigatoriamente os itens.',
      'NUNCA retorne pay_expenses com items vazio.',
      'Se o usuario falar que pagou algo, mas sem dizer qual conta, use intent unknown (nao use pay_expenses).',
      'Exemplo: "mude o valor da despesa de energia para 110 reais" -> {"intent":"update_expense","expenseName":"energia","newValue":110}',
      'Exemplo: "altere energia para 110" -> {"intent":"update_expense","expenseName":"energia","newValue":110}',
      'Exemplo: "atualize a conta de internet para 99,90" -> {"intent":"update_expense","expenseName":"internet","newValue":99.90}',
      'Exemplo: "mude energia" -> {"intent":"update_expense","expenseName":"energia"}',
      'Exemplo: "acabei de pagar a renegociacao e o cartao" -> {"intent":"pay_expenses","items":["renegociacao","cartao"]}',
      'Exemplo: "eu paguei a energia" -> {"intent":"pay_expenses","items":["energia"]}',
      'Exemplo: "quitei luz, agua e internet" -> {"intent":"pay_expenses","items":["luz","agua","internet"]}',
      'Exemplo: "dei baixa na fatura do nubank" -> {"intent":"pay_expenses","items":["fatura do nubank"]}',
      'Exemplo negativo: "ja paguei" -> {"intent":"unknown"}',
      'Mensagem do usuario:',
      input,
    ].join('\n')

    const response = await this.client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema,
      },
    })

    const payload = safeJsonParse(response.text)
    return asParsedCommand(payload)
  }
}
