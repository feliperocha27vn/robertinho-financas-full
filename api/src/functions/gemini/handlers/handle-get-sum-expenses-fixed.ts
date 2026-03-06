import { getSumExpensesFixed } from '../../expenses/get-sum-expenses-fixed'

export async function handleGetSumExpensesFixed(args: Record<string, any> | undefined) {
  const message = args?.message as string
  // Executa a função para obter o total das despesas fixas
  const { totalFixedExpenses, items } = await getSumExpensesFixed()
  const formattedTotal = Number(totalFixedExpenses).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const detailed = items && items.length > 0

  if (detailed) {
    const itemsList = items.map(item => {
      const itemAmount = Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const installmentInfo = item.numberOfInstallments && item.numberOfInstallments > 1
        ? ` (Parcelado em ${item.numberOfInstallments}x)`
        : ''
      return `🔹 ${item.description}: ${itemAmount}${installmentInfo}`
    }).join('\n')

    return {
      message: message ? `${message}\n\n📌 Lista de Despesas Fixas:\n\n${itemsList}\n\n🏠 Total Fixo: ${formattedTotal}` : `📌 Lista de Despesas Fixas:\n\n${itemsList}\n\n🏠 Total Fixo: ${formattedTotal}`,
    }
  }

  return {
    message: message ? `${message}\n\n🏠 Total das suas despesas fixas: ${formattedTotal}` : `🏠 Total das suas despesas fixas: ${formattedTotal}`,
  }
}
