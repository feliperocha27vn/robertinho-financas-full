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

function randomId(): string {
  return Math.random().toString(36).slice(2)
}

export class InMemoryFoodCatalogRepository implements FoodCatalogRepository {
  private byId = new Map<string, FoodCatalogItem>()
  private aliasToId = new Map<string, string>()

  async findByAlias(alias: string): Promise<FoodCatalogItem | null> {
    const normalized = normalize(alias)
    const id = this.aliasToId.get(normalized)
    if (!id) return null
    return this.byId.get(id) ?? null
  }

  async findById(id: string): Promise<FoodCatalogItem | null> {
    return this.byId.get(id) ?? null
  }

  async findCandidatesByGroup(
    foodGroup: DietFoodGroup
  ): Promise<FoodCatalogItem[]> {
    return Array.from(this.byId.values()).filter(item => item.foodGroup === foodGroup)
  }

  async upsertMany(items: UpsertFoodCatalogInput[]): Promise<void> {
    for (const item of items) {
      const normalizedName = normalize(item.canonicalName)
      let existing = Array.from(this.byId.values()).find(
        current => current.normalizedName === normalizedName
      )

      if (!existing) {
        existing = {
          id: randomId(),
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
          aliases: [],
        }
      }

      const aliasSet = new Set([
        ...existing.aliases,
        ...item.aliases,
        item.canonicalName,
      ])

      existing.aliases = Array.from(aliasSet)
      existing.foodGroup = item.foodGroup
      existing.baseAmount = item.baseAmount ?? null
      existing.baseUnit = item.baseUnit ?? null
      existing.calories = item.calories ?? null
      existing.protein = item.protein ?? null
      existing.carbs = item.carbs ?? null
      existing.fat = item.fat ?? null
      existing.fiber = item.fiber ?? null
      existing.sourceType = item.sourceType
      existing.sourceRef = item.sourceRef ?? null

      this.byId.set(existing.id, existing)
      for (const alias of existing.aliases) {
        this.aliasToId.set(normalize(alias), existing.id)
      }
    }
  }
}
