import { getSumExpensesOfMonthVariables } from '../../expenses/get-sum-expenes-of-month-variables'

export async function handleGetSumExpensesOfMonthVariables(args: Record<string, any> | undefined) {
  // Executa a função para obter o total das despesas variáveis do mês corrente
  const message = args?.message as string

  const { totalExpensesOfMonth, items } = await getSumExpensesOfMonthVariables()
  const formattedTotal = Number(totalExpensesOfMonth).toLocaleString(
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
        message ? `${message}\n\n📌 **Lista de Despesas Variáveis do Mês:**\n\n${itemsList}\n\n💰 **Total Variável:** ${formattedTotal}` :
        `📌 **Lista de Despesas Variáveis do Mês:**\n\n${itemsList}\n\n💰 **Total Variável:** ${formattedTotal}`,
    }
  }

  return {
    message:
      message ? `${message}\n\n💰 **Total das suas despesas variáveis deste mês:** ${formattedTotal}` :
      `💰 **Total das suas despesas variáveis deste mês:** ${formattedTotal}`,
  }
}
