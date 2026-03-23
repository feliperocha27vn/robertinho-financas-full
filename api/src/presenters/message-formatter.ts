import type { TransactionType } from '../domain/finance'

function toCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function toDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function categoryLabel(category: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    TRANSPORT: 'Transporte',
    OTHERS: 'Outros',
    STUDIES: 'Estudos',
    RESIDENCE: 'Moradia',
    CREDIT: 'Credito',
  }

  return labels[category]
}

function toMonthYear(date: Date): string {
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date)
  const year = new Intl.DateTimeFormat('pt-BR', { year: 'numeric' }).format(
    date
  )
  return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

interface CreateExpenseMessageInput {
  description: string
  amount: number
  category: TransactionType
  createdAt: Date
  isFixed: boolean
  monthPartialTotal?: number
}

interface ExpenseListItem {
  description: string
  amount: number
}

export class MessageFormatter {
  static createExpenseSuccess(input: CreateExpenseMessageInput): string {
    const parts = [
      '✅ <b>Despesa Registrada com Sucesso!</b>',
      '',
      `🧾 <i>${escapeHtml(input.description)}</i>`,
      `🏷️ <b>Categoria:</b> ${categoryLabel(input.category)}`,
      `💰 <b>Valor:</b> ${toCurrency(input.amount)}`,
      `📅 <b>Data:</b> ${toDate(input.createdAt)}`,
      `🔁 <b>Tipo:</b> ${input.isFixed ? 'Fixa' : 'Variavel'}`,
    ]

    if (input.monthPartialTotal !== undefined) {
      parts.push(
        `📊 <b>Total parcial do mes:</b> ${toCurrency(input.monthPartialTotal)}`
      )
    }

    return parts.join('\n')
  }

  static monthlySummary(input: {
    referenceDate: Date
    fixedExpenses: number
    variableExpenses: number
    overallTotal?: number
  }): string {
    const totalSpent = input.fixedExpenses + input.variableExpenses
    const parts = [
      `📊 <b>Resumo de ${toMonthYear(input.referenceDate)}</b>`,
      '',
      `🔴 <b>Despesas Fixas:</b> ${toCurrency(input.fixedExpenses)}`,
      `🟡 <b>Despesas Variaveis:</b> ${toCurrency(input.variableExpenses)}`,
      '---',
      `📉 <b>TOTAL GASTO:</b> ${toCurrency(totalSpent)}`,
    ]

    if (input.overallTotal !== undefined) {
      parts.push(
        `🧮 <b>Total geral acumulado:</b> ${toCurrency(input.overallTotal)}`
      )
    }

    return parts.join('\n')
  }

  static totalWithItems(input: {
    title: string
    emoji: string
    totalLabel: string
    totalAmount: number
    items: ExpenseListItem[]
  }): string {
    const topItems = input.items.slice(0, 5)

    const parts = [
      `${input.emoji} <b>${input.title}</b>`,
      '',
      `💰 <b>${input.totalLabel}:</b> ${toCurrency(input.totalAmount)}`,
    ]

    if (topItems.length > 0) {
      parts.push('', '<i>Principais lancamentos:</i>')
      for (const item of topItems) {
        parts.push(
          `• ${escapeHtml(item.description)} — ${toCurrency(item.amount)}`
        )
      }
    }

    return parts.join('\n')
  }

  static payExpensesSuccess(input: {
    paidDescriptions: string[]
    notFound?: string[]
  }): string {
    const paidList = input.paidDescriptions.join(', ')
    const parts = [
      `✅ <b>Contas marcadas como pagas:</b> ${escapeHtml(paidList || 'Nenhuma')}`,
    ]

    if (input.notFound && input.notFound.length > 0) {
      parts.push(
        `⚠️ <i>Nao encontrei:</i> ${escapeHtml(input.notFound.join(', '))}`
      )
    }

    return parts.join('\n')
  }

  static payExpensesAmbiguity(input: {
    term: string
    options: string[]
  }): string {
    const optionsText = input.options
      .map(option => `• ${escapeHtml(option)}`)
      .join('\n')

    return [
      `🤔 <b>Encontrei mais de uma opcao para:</b> <i>${escapeHtml(input.term)}</i>`,
      'Voce se refere a qual destas?',
      optionsText,
    ].join('\n')
  }

  static accountsPayableNextMonth(input: {
    referenceDate: Date
    items: ExpenseListItem[]
    totalAmount: number
  }): string {
    const parts = [
      `📅 <b>Contas para ${toMonthYear(input.referenceDate)}</b>`,
      '',
      `🧾 <b>Quantidade de contas:</b> ${input.items.length}`,
      `💰 <b>Total previsto:</b> ${toCurrency(input.totalAmount)}`,
    ]

    if (input.items.length > 0) {
      parts.push('', '<i>Detalhamento:</i>')
      for (const item of input.items) {
        parts.push(
          `• ${escapeHtml(item.description)} — ${toCurrency(item.amount)}`
        )
      }
    }

    return parts.join('\n')
  }

  static updateExpenseAmountSuccess(input: {
    description: string
    oldAmount: number
    newAmount: number
  }): string {
    return [
      '✏️ <b>Despesa atualizada com sucesso!</b>',
      '',
      `🧾 <b>Despesa:</b> ${escapeHtml(input.description)}`,
      `💸 <b>Valor anterior:</b> ${toCurrency(input.oldAmount)}`,
      `💰 <b>Novo valor:</b> ${toCurrency(input.newAmount)}`,
    ].join('\n')
  }

  static updateExpenseAmountAmbiguity(input: { options: string[] }): string {
    const optionsText = input.options
      .map(option => `• ${escapeHtml(option)}`)
      .join('\n')
    return [
      '🤔 <b>Encontrei mais de uma despesa com esse nome.</b>',
      'Voce pode me dizer qual delas quer atualizar?',
      optionsText,
    ].join('\n')
  }
}
