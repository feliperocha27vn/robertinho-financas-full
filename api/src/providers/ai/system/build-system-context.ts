import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function readPromptPart(name: 'base' | 'finance' | 'diet'): string {
  try {
    return readFileSync(join(__dirname, `${name}.txt`), 'utf8').trim()
  } catch {
    const fallback = {
      base: 'Voce e o Robertinho, assistente financeiro e de dieta com function calling.',
      finance: 'Para total geral de despesas use get_sum_expenses.',
      diet: 'Para consultar calorias use search_food_nutrition.',
    } as const

    return fallback[name]
  }
}

export function buildSystemContext(input: {
  currentState?: string
  pendingData?: Record<string, unknown>
}): string {
  const base = readPromptPart('base')
  const finance = readPromptPart('finance')
  const diet = readPromptPart('diet')

  return [
    base,
    finance,
    diet,
    `A data atual do sistema e ${new Date().toISOString()}.`,
    'Ao chamar funcoes com datas (parcelas e vencimentos), calcule data ISO absoluta correta no fuso horario do Brasil.',
    `ESTADO_ATUAL_DA_SESSAO: ${input.currentState ?? 'idle'}`,
    `DADOS_PENDENTES: ${JSON.stringify(input.pendingData ?? {})}`,
    '',
    'DIRETRIZES DE FORMATACAO VISUAL (UI/UX) - OBRIGATORIAS',
    'Nunca responda com texto seco ou lista crua ao relatar dados financeiros.',
    'Sempre responda como interface premium com recibos e dashboards legiveis.',
    'Valores monetarios e rotulos devem estar sempre em <b>negrito</b>.',
    'Use emojis contextuais obrigatoriamente em cada item (ex: energia, gasolina, mercado, agua, saude).',
    'Use linhas separadoras com --- para estruturar dashboards.',
  ].join('\n')
}
