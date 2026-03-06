import { getRemainingInstallments } from '../../expenses/get-remaining-installments'

export async function handleGetRemainingInstallments(args: Record<string, any> | undefined) {
  const name_expense = args?.name_expense as string

  // Executa a função que busca as parcelas restantes
  const {
    remainingInstallments,
    found,
    expenseDescription,
    totalRemaining,
    valueInstallmentOfExpense,
  } = await getRemainingInstallments({
    nameExpense: name_expense,
  })

  if (!found) {
    return {
      message: `😕 Não Encontrado!\n\nNão achei nenhuma despesa parcelada parecida com "${name_expense}".\n💡 Dica: Tente usar parte do nome ou outra palavra-chave (ex: "mouse rapoo").`,
    }
  }

  const formattedTotal = totalRemaining
    ? Number(totalRemaining).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : undefined

  const formattedPerInstallment = valueInstallmentOfExpense
    ? Number(valueInstallmentOfExpense).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : undefined

  return {
    message: `🔎 Parcelas Encontradas: "${expenseDescription}"\n\n📋 Restantes: ${remainingInstallments} parcela(s)${formattedPerInstallment ? `\n💸 Valor Aproximado: ${formattedPerInstallment} por parcela` : ''}${formattedTotal ? `\n💰 Total Restante: ${formattedTotal}` : ''}`,
  }
}
