import { Prisma } from '@prisma/client'
import type { RecipeItem } from '../../domain/finance'
import { prisma } from '../../lib/prisma'
import type {
  CreateRecipeInput,
  RecipesRepository,
} from '../contracts/recipes-repository'

export class PrismaRecipesRepository implements RecipesRepository {
  async create(input: CreateRecipeInput): Promise<RecipeItem> {
    const created = await prisma.recipes.create({
      data: {
        description: input.description,
        amount: new Prisma.Decimal(input.amount),
      },
    })

    return {
      id: created.id,
      description: created.description,
      amount: Number(created.amount),
      createdAt: created.createdAt,
    }
  }

  async sumInRange(start: Date, end: Date): Promise<number> {
    const { _sum } = await prisma.recipes.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: start, lte: end } },
    })

    return Number(_sum.amount ?? 0)
  }
}
