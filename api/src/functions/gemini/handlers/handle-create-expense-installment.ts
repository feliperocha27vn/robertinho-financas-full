import { createExpenseInstallment } from '../../expenses/create-new-expense-installment'

export async function handleCreateExpenseInstallment(args: Record<string, any> | undefined) {
  const description = args?.description as string
  const amount = args?.amount as number
  const category = args?.category as 'CREDIT' | 'OTHERS'
  const numberOfInstallments = args?.numberOfInstallments as number
  const firstDueDateString = args?.firstDueDate as string
  const message = args?.message as string

  // Converte a string da data para Date
  const firstDueDate = new Date(firstDueDateString)

  // Executa a função que a IA pediu para chamar
  await createExpenseInstallment({
    description,
    amount,
    category,
    numberOfInstallments,
    firstDueDate,
  })

  const formattedAmount = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return {
    message:
      message ? `${message}\n\n✅ Despesa Parcelada Registrada!\n\n🛍️ Item: ${description}\n💸 Valor Total: ${formattedAmount}\n💳 Parcelas: ${numberOfInstallments}x\n📅 Primeira Parcela: ${firstDueDate.toLocaleDateString('pt-BR')}` :
      `✅ Despesa Parcelada Registrada!\n\n🛍️ Item: ${description}\n💸 Valor Total: ${formattedAmount}\n💳 Parcelas: ${numberOfInstallments}x\n📅 Primeira Parcela: ${firstDueDate.toLocaleDateString('pt-BR')}`,
  }
}
