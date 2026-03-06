import { unpaidExpensesOfCurrentMonth } from '../../expenses/unpaid-expenses-of-current-month'

export async function handleGetUnpaidExpensesOfCurrentMonth(args: Record<string, any> | undefined) {
  const message = args?.message as string

  const { totalUnpaidAmount, unpaidExpenses } = await unpaidExpensesOfCurrentMonth()
  const formattedTotal = Number(totalUnpaidAmount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  if (unpaidExpenses && unpaidExpenses.length > 0) {
    const itemsList = unpaidExpenses
      .map(item => {
        const itemAmount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        return `🔹 ${item.description}: ${itemAmount}`
      })
      .join('\n')

    return {
      message:
        message ? `${message}\n\n📌 Contas Pendentes Neste Mês:\n\n${itemsList}\n\n💰 Total a Pagar: ${formattedTotal}` :
        `📌 Contas Pendentes Neste Mês:\n\n${itemsList}\n\n💰 Total a Pagar: ${formattedTotal}`,
    }
  }

  return {
    message:
      message ? `${message}\n\nVocê não tem contas pendentes registradas para este mês! 🎉` :
      `Você não tem contas pendentes registradas para este mês! 🎉`,
  }
}
