import { prisma } from '../../lib/prisma'
import type {
  FoodCatalogItem,
  FoodCatalogRepository,
  UpsertFoodCatalogInput,
} from '../contracts/food-catalog-repository'
import type { DietFoodGroup } from '../contracts/diet-repository'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  return Number(value)
}

function mapCatalogItem(item: {
  id: string
  canonicalName: string
  normalizedName: string
  foodGroup: string
  baseAmount: unknown
  baseUnit: string | null
  calories: unknown
  protein: unknown
  carbs: unknown
  fat: unknown
  fiber: unknown
  sourceType: string
  sourceRef: string | null
  aliases: Array<{ alias: string }>
}): FoodCatalogItem {
  return {
    id: item.id,
    canonicalName: item.canonicalName,
    normalizedName: item.normalizedName,
    foodGroup: item.foodGroup as DietFoodGroup,
    baseAmount: toNumber(item.baseAmount),
    baseUnit: item.baseUnit,
    calories: toNumber(item.calories),
    protein: toNumber(item.protein),
    carbs: toNumber(item.carbs),
    fat: toNumber(item.fat),
    fiber: toNumber(item.fiber),
    sourceType: item.sourceType as 'CATALOG' | 'BRAZIL_STATIC' | 'USDA',
    sourceRef: item.sourceRef,
    aliases: item.aliases.map(alias => alias.alias),
  }
}

export class PrismaFoodCatalogRepository implements FoodCatalogRepository {
  async findByAlias(alias: string): Promise<FoodCatalogItem | null> {
    const normalized = normalize(alias)

    const byAlias = await prisma.foodAlias.findUnique({
      where: { aliasNormalized: normalized },
      include: {
        foodCatalog: {
          include: {
            aliases: true,
          },
        },
      },
    })

    if (byAlias) {
      return mapCatalogItem(byAlias.foodCatalog)
    }

    const byCanonical = await prisma.foodCatalog.findUnique({
      where: { normalizedName: normalized },
      include: { aliases: true },
    })

    if (!byCanonical) {
      return null
    }

    return mapCatalogItem(byCanonical)
  }

  async findById(id: string): Promise<FoodCatalogItem | null> {
    const item = await prisma.foodCatalog.findUnique({
      where: { id },
      include: { aliases: true },
    })

    if (!item) {
      return null
    }

    return mapCatalogItem(item)
  }

  async findCandidatesByGroup(
    foodGroup: DietFoodGroup
  ): Promise<FoodCatalogItem[]> {
    const items = await prisma.foodCatalog.findMany({
      where: { foodGroup },
      include: { aliases: true },
    })

    return items.map(mapCatalogItem)
  }

  async upsertMany(items: UpsertFoodCatalogInput[]): Promise<void> {
    await prisma.$transaction(
      items.map(item => {
        const normalizedName = normalize(item.canonicalName)
        const aliasesByNormalized = new Map<string, string>()
        for (const alias of [...item.aliases, item.canonicalName]) {
          const aliasNormalized = normalize(alias)
          if (!aliasesByNormalized.has(aliasNormalized)) {
            aliasesByNormalized.set(aliasNormalized, alias)
          }
        }

        const aliases = Array.from(aliasesByNormalized.entries()).map(
          ([aliasNormalized, alias]) => ({
            alias,
            aliasNormalized,
          })
        )

        return prisma.foodCatalog.upsert({
          where: { normalizedName },
          update: {
            canonicalName: item.canonicalName,
            foodGroup: item.foodGroup,
            baseAmount: item.baseAmount ?? null,
            baseUnit: item.baseUnit ?? null,
            calories: item.calories ?? null,
            protein: item.protein ?? null,
            carbs: item.carbs ?? null,
            fat: item.fat ?? null,
            fiber: item.fiber ?? null,
            sourceType: item.sourceType,
            sourceRef: item.sourceRef ?? null,
            aliases: {
              deleteMany: {},
              create: aliases,
            },
          },
          create: {
            canonicalName: item.canonicalName,
            normalizedName,
            foodGroup: item.foodGroup,
            baseAmount: item.baseAmount ?? null,
            baseUnit: item.baseUnit ?? null,
            calories: item.calories ?? null,
            protein: item.protein ?? null,
            carbs: item.carbs ?? null,
            fat: item.fat ?? null,
            fiber: item.fiber ?? null,
            sourceType: item.sourceType,
            sourceRef: item.sourceRef ?? null,
            aliases: {
              create: aliases,
            },
          },
        })
      })
    )
  }
}
