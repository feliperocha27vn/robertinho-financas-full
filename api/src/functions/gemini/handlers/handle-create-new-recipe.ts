import { createNewRecipe } from '../../recipes/create-new-recipe'

export async function handleCreateNewRecipe(args: Record<string, any> | undefined) {
  const description = args?.description as string
  const amount = args?.amount as number

  // Executa a função que a IA pediu para chamar
  await createNewRecipe({
    description,
    amount,
  })

  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return {
    message: `🎉 **Nova Receita Registrada!**\n\n📈 **Origem:** ${description}\n💰 **Valor:** ${formattedAmount}`,
  }
}
