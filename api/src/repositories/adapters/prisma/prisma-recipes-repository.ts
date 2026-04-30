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

  async findAll(): Promise<RecipeItem[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.recipes.findMany({
          orderBy: { createdAt: 'desc' },
        }),
      'recipesRepository.findAll'
    )

    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      createdAt: item.createdAt,
    }))
  }

  async findById(id: string): Promise<RecipeItem | null> {
    const item = await withPrismaRetry(
      () => prisma.recipes.findUnique({ where: { id } }),
      'recipesRepository.findById'
    )

    if (!item) return null

    return {
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      createdAt: item.createdAt,
    }
  }

  async update(id: string, input: CreateRecipeInput): Promise<RecipeItem> {
    const updated = await withPrismaRetry(
      () =>
        prisma.recipes.update({
          where: { id },
          data: {
            description: input.description,
            amount: new Prisma.Decimal(input.amount),
          },
        }),
      'recipesRepository.update'
    )

    return {
      id: updated.id,
      description: updated.description,
      amount: Number(updated.amount),
      createdAt: updated.createdAt,
    }
  }

  async delete(id: string): Promise<void> {
    await withPrismaRetry(
      () => prisma.recipes.delete({ where: { id } }),
      'recipesRepository.delete'
    )
  }
}
