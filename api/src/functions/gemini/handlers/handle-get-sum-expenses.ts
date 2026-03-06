import { getSumExpenses } from '../../expenses/get-sum-expenses'

export async function handleGetSumExpenses(args: Record<string, any> | undefined) {
  const message = args?.message as string

  // Executa a função para obter o total das despesas e a lista
  const { totalExpenses, items } = await getSumExpenses()
  const formattedTotal = Number(totalExpenses).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  if (items && items.length > 0) {
    const itemsList = items.map(item => {
      const itemAmount = Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const installmentInfo = item.numberOfInstallments && item.numberOfInstallments > 1
        ? ` (Parcelado em ${item.numberOfInstallments}x)`
        : ''
      return `🔹 ${item.description}: ${itemAmount}${installmentInfo}`
    }).join('\n')

    return {
      message: message ? `${message}\n\n📌 Lista de Todas as Suas Despesas:\n\n${itemsList}\n\n💰 Total Geral: ${formattedTotal}` : `📌 Lista de Todas as Suas Despesas:\n\n${itemsList}\n\n💰 Total Geral: ${formattedTotal}`,
    }
  }

  return {
    message: message ? `${message}\n\n💰 Total das suas despesas: ${formattedTotal}` : `💰 Total das suas despesas: ${formattedTotal}`,
  }
}
