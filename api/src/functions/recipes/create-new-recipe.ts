import { prisma } from '../../lib/prisma'

interface CreateNewRecipeRequest {
  description: string
  amount: number
}

export async function createNewRecipe({
  description,
  amount,
}: CreateNewRecipeRequest) {
  await prisma.recipes.create({
    data: {
      description,
      amount,
    },
  })
}
