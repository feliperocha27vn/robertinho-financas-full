import { createExpense } from '../../expenses/create-new-expense'

export async function handleCreateExpense(args: Record<string, any> | undefined) {
  const description = args?.description as string
  const amount = args?.amount as number
  const category = args?.category as
    | 'TRANSPORT'
    | 'OTHERS'
    | 'STUDIES'
    | 'RESIDENCE'
    | 'CREDIT'
  const message = args?.message as string
  const isFixed = args?.isFixed as boolean | undefined

  // Executa a função que a IA pediu para chamar
  await createExpense({
    description,
    amount,
    category,
    isFixed,
  })

  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const categoryLabels: Record<string, string> = {
    TRANSPORT: 'transporte',
    OTHERS: 'outros',
    STUDIES: 'estudos',
    RESIDENCE: 'moradia',
    CREDIT: 'créditos',
  }

  const categoryLabel =
    categoryLabels[category] ?? category?.toLowerCase() ?? 'outra'

  if (isFixed) {
    return {
      message:
        message ? `${message}\n\n✅ Despesa Fixa Registrada!\n\n📝 Descrição: ${description}\n💸 Valor: ${formattedAmount}` :
        `✅ Despesa Fixa Registrada!\n\n📝 Descrição: ${description}\n💸 Valor: ${formattedAmount}`,
    }
  }

  return {
    message:
      message ? `${message}\n\n✅ Despesa Registrada!\n\n🏷️ Categoria: ${categoryLabel}\n💸 Valor: ${formattedAmount}` :
      `✅ Despesa Registrada!\n\n🏷️ Categoria: ${categoryLabel}\n💸 Valor: ${formattedAmount}`,
  }
}
