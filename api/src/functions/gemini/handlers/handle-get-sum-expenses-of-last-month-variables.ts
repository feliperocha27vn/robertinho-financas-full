import { getSumExpensesOfLastMonthVariables } from '../../expenses/get-sum-expenses-of-last-month-variables'

export async function handleGetSumExpensesOfLastMonthVariables(args: Record<string, any> | undefined) {
  const message = args?.message as string

  const { totalExpensesOfLastMonth, items } = await getSumExpensesOfLastMonthVariables()
  const formattedTotal = Number(totalExpensesOfLastMonth).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )

  if (items && items.length > 0) {
    const itemsList = items.map(item => {
      const itemAmount = Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const installmentInfo = item.numberOfInstallments && item.numberOfInstallments > 1
        ? ` (Parcelado em ${item.numberOfInstallments}x)`
        : ''
      return `🔹 **${item.description}**: ${itemAmount}${installmentInfo}`
    }).join('\n')

    return {
      message:
        message ? `${message}\n\n📌 **Lista de Despesas Variáveis do Mês Passado:**\n\n${itemsList}\n\n💰 **Total Variável:** ${formattedTotal}` :
        `📌 **Lista de Despesas Variáveis do Mês Passado:**\n\n${itemsList}\n\n💰 **Total Variável:** ${formattedTotal}`,
    }
  }

  return {
    message:
      message ? `${message}\n\n💰 **Total das suas despesas variáveis no mês passado:** ${formattedTotal}` :
      `💰 **Total das suas despesas variáveis no mês passado:** ${formattedTotal}`,
  }
}
