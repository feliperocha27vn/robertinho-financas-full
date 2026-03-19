import { getAllRemainingInstallments } from '../../expenses/get-all-remaining-installments'

export async function handleGetAllRemainingInstallments() {
  const { installments, totalOverallRemaining } = await getAllRemainingInstallments()

  if (installments.length === 0) {
    return {
      message: '🎉 Oba! Não encontrei nenhuma compra parcelada pendente. Você está com tudo em dia! 🚀',
    }
  }

  let message = '📋 Aqui estão suas compras parceladas pendentes:\n\n'

  for (const group of installments) {
    const formattedTotal = Number(group.totalRemaining).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    const formattedInstallment = Number(group.installmentValue).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    message += `🔹 ${group.expenseDescription}\n`
    message += `   📉 Restam: ${group.remainingCount}x de ${formattedInstallment}\n`
    message += `   💰 Total Restante: ${formattedTotal}\n\n`
  }

  const formattedOverall = totalOverallRemaining.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  message += `➖➖➖➖➖➖➖➖➖➖\n`
  message += `💰 TOTAL GERAL PENDENTE: ${formattedOverall}\n\n`
  message += `💡 Se quiser quitar alguma, é só me avisar!`

  return { message }
}
