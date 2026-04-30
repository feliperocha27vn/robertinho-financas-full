import { Prisma } from '@prisma/client'
import type { RecipeItem } from '../../../lib/types'
import { prisma } from '../../../lib/prisma'
import { withPrismaRetry } from '../../../utils/prisma-retry'
import type {
  CreateRecipeInput,
  RecipesRepository,
} from '../../contracts/recipes-repository'

export class PrismaRecipesRepository implements RecipesRepository {
  async create(input: CreateRecipeInput): Promise<RecipeItem> {
    const created = await withPrismaRetry(
      () =>
        prisma.recipes.create({
          data: {
            description: input.description,
            amount: new Prisma.Decimal(input.amount),
          },
        }),
      'recipesRepository.create'
    )

    return {
      id: created.id,
      description: created.description,
      amount: Number(created.amount),
      createdAt: created.createdAt,
    }
  }

  async sumInRange(start: Date, end: Date): Promise<number> {
    const { _sum } = await withPrismaRetry(
      () =>
        prisma.recipes.aggregate({
          _sum: { amount: true },
          where: { createdAt: { gte: start, lte: end } },
        }),
      'recipesRepository.sumInRange'
    )

    return Number(_sum.amount ?? 0)
  }
}
