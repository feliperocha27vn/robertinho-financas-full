import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function readPromptPart(name: 'base' | 'finance'): string {
  try {
    return readFileSync(join(__dirname, `${name}.txt`), 'utf8').trim()
  } catch {
    const fallback = {
      base: 'Voce e o Robertinho, assistente financeiro com function calling.',
      finance: 'Para total geral de despesas use get_sum_expenses.',
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

  return [
    base,
    finance,
    `A data atual do sistema e ${new Date().toISOString()}.`,
    'Ao chamar funcoes com datas (parcelas e vencimentos), calcule data ISO absoluta correta no fuso horario do Brasil.',
    `ESTADO_ATUAL_DA_SESSAO: ${input.currentState ?? 'idle'}`,
    `DADOS_PENDENTES: ${JSON.stringify(input.pendingData ?? {})}`,
  ].join('\n')
}
