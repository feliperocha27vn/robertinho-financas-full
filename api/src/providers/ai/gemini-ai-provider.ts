import type { AiProvider, ParsedAssistantCommand } from './ai-provider'

function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function toNumber(raw: string): number {
  if (raw.includes(',') && raw.includes('.')) {
    return Number(raw.replace(/\./g, '').replace(',', '.'))
  }

  if (raw.includes(',')) {
    return Number(raw.replace(',', '.'))
  }

  return Number(raw)
}

function extractDate(input: string): Date | undefined {
  const match = input.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/)
  if (!match) {
    return undefined
  }

  const day = Number(match[1])
  const month = Number(match[2])

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return undefined
  }

  const currentYear = new Date().getFullYear()
  const rawYear = match[3]
  const year = rawYear
    ? rawYear.length === 2
      ? 2000 + Number(rawYear)
      : Number(rawYear)
    : currentYear

  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date
}

function extractInstallments(input: string): number | undefined {
  const patterns = [/\b(\d{1,3})\s*x\b/i, /\b(\d{1,3})\s*parcelas?\b/i]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match?.[1]) {
      const value = Number(match[1])
      if (value > 1) {
        return value
      }
    }
  }

  return undefined
}

function extractAmount(input: string): number | undefined {
  const currencyRegex =
    /(?:r\$\s*)(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})|\d+(?:[.,]\d{1,2})?)/gi
  const currencyMatches = Array.from(input.matchAll(currencyRegex))
  if (currencyMatches.length > 0) {
    const value = currencyMatches[currencyMatches.length - 1][1]
    return toNumber(value)
  }

  const genericRegex =
    /\b\d{1,3}(?:\.\d{3})*(?:,\d{1,2})\b|\b\d+(?:\.\d{1,2})?\b/g
  const numberMatches = Array.from(input.matchAll(genericRegex))
    .map(match => ({
      value: match[0],
      index: match.index ?? 0,
    }))
    .filter(({ index }) => {
      const nextChar = input[index + 1]
      const prevChar = input[index - 1]
      if (nextChar?.toLowerCase() === 'x' || prevChar?.toLowerCase() === 'x') {
        return false
      }
      return true
    })

  if (numberMatches.length === 0) {
    return undefined
  }

  const parsed = numberMatches
    .map(({ value }) => toNumber(value))
    .filter(value => !Number.isNaN(value))

  if (parsed.length === 0) {
    return undefined
  }

  return parsed.reduce((max, value) => (value > max ? value : max), parsed[0])
}

function cleanNameExpense(input: string, expressions: string[]): string {
  let result = input
  for (const expression of expressions) {
    result = result.replace(expression, '')
  }

  return result.replace(/\s+/g, ' ').trim()
}

function extractDescription(input: string): string {
  const cleaned = input
    .replace(
      /\b(gastei|despesa|receita|registrar|cadastrar|comprei|compra|paguei)\b/gi,
      ''
    )
    .replace(/\br\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?\b/gi, '')
    .replace(/\b\d+\s*x\b/gi, '')
    .replace(/\b\d+\s*parcelas?\b/gi, '')
    .replace(/[,:;.!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned || input.trim()
}

function inferCategory(input: string): ParsedAssistantCommand['category'] {
  const text = normalizeText(input)
  if (
    text.includes('uber') ||
    text.includes('onibus') ||
    text.includes('transporte')
  ) {
    return 'TRANSPORT'
  }
  if (
    text.includes('aluguel') ||
    text.includes('moradia') ||
    text.includes('internet')
  ) {
    return 'RESIDENCE'
  }
  if (
    text.includes('curso') ||
    text.includes('livro') ||
    text.includes('estudo')
  ) {
    return 'STUDIES'
  }
  if (
    text.includes('cartao') ||
    text.includes('fatura') ||
    text.includes('credito')
  ) {
    return 'CREDIT'
  }
  return 'OTHERS'
}

export class GeminiAiProvider implements AiProvider {
  async parseMessage(input: string): Promise<ParsedAssistantCommand> {
    const normalized = normalizeText(input)
    const amount = extractAmount(input)
    const date = extractDate(input)
    const installments = extractInstallments(input)
    const description = extractDescription(input)

    if (date && !normalized.includes('parcel')) {
      return {
        intent: 'unknown',
        firstDueDate: date,
      }
    }

    if (
      normalized.includes('paguei tudo') ||
      normalized.includes('paguei todas') ||
      normalized.includes('ja paguei tudo') ||
      normalized.includes('quitei tudo')
    ) {
      return { intent: 'pay_all_unpaid_current_month' }
    }

    if (
      normalized.includes('ainda nao paguei') ||
      normalized.includes('desmarcar pagamento') ||
      normalized.includes('desfazer pagamento') ||
      normalized.includes('voltar para pendente')
    ) {
      const nameExpense = cleanNameExpense(normalized, [
        'ainda nao paguei',
        'desmarcar pagamento',
        'desfazer pagamento',
        'voltar para pendente',
      ])

      return { intent: 'unpay_expense', nameExpense }
    }

    if (
      normalized.startsWith('paguei ') ||
      normalized.startsWith('quitei ') ||
      normalized.includes('marcar como pago')
    ) {
      return {
        intent: 'pay_installment',
        nameExpense: cleanNameExpense(normalized, [
          'paguei',
          'quitei',
          'marcar como pago',
          'a parcela de',
        ]),
      }
    }

    if (
      (normalized.includes('contas') || normalized.includes('despesas')) &&
      (normalized.includes('proximo mes') || normalized.includes('mes que vem'))
    ) {
      return { intent: 'accounts_payable_next_month' }
    }

    if (
      normalized.includes('contas pendentes') ||
      normalized.includes('falta pagar') ||
      normalized.includes('pendente neste mes') ||
      normalized.includes('em aberto neste mes')
    ) {
      return { intent: 'get_unpaid_expenses_of_current_month' }
    }

    if (
      normalized.includes('parcelas faltam') ||
      normalized.includes('quantas parcelas faltam')
    ) {
      return {
        intent: 'get_remaining_installments',
        nameExpense: cleanNameExpense(normalized, [
          'parcelas faltam',
          'quantas parcelas faltam',
          'da',
          'do',
          'de',
        ]),
      }
    }

    if (
      normalized.includes('parceladas pendentes') ||
      normalized.includes('todas parcelas') ||
      normalized.includes('compras parceladas')
    ) {
      return { intent: 'get_all_remaining_installments' }
    }

    if (normalized.includes('despesas fixas')) {
      return { intent: 'get_sum_expenses_fixed' }
    }

    if (normalized.includes('mes passado') && normalized.includes('variavel')) {
      return { intent: 'get_sum_expenses_of_last_month_variables' }
    }

    if (normalized.includes('mes atual') && normalized.includes('variavel')) {
      return { intent: 'get_sum_expenses_of_month_variables' }
    }

    if (normalized.includes('receita') || normalized.includes('ganhei')) {
      return {
        intent: 'create_new_recipe',
        description,
        amount,
      }
    }

    if (normalized.includes('parcelad')) {
      return {
        intent: 'create_expense_installment',
        description,
        amount,
        numberOfInstallments: installments,
        category: inferCategory(input),
        firstDueDate: date,
      }
    }

    if (normalized.includes('despesa') || normalized.includes('gastei')) {
      return {
        intent: 'create_expense',
        description,
        amount,
        category: inferCategory(input),
        isFixed:
          normalized.includes('fixa') || normalized.includes('recorrente'),
      }
    }

    if (normalized.includes('saldo') || normalized.includes('resumo')) {
      return { intent: 'get_sum_expenses' }
    }

    return { intent: 'unknown' }
  }
}
