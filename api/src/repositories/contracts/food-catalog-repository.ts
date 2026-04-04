import type { DietFoodGroup } from './diet-repository'

export interface FoodCatalogItem {
  id: string
  canonicalName: string
  normalizedName: string
  foodGroup: DietFoodGroup
  baseAmount: number | null
  baseUnit: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  sourceType: 'CATALOG' | 'BRAZIL_STATIC' | 'USDA'
  sourceRef: string | null
  aliases: string[]
}

export interface UpsertFoodCatalogInput {
  canonicalName: string
  foodGroup: DietFoodGroup
  baseAmount?: number | null
  baseUnit?: string | null
  calories?: number | null
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  fiber?: number | null
  sourceType: 'CATALOG' | 'BRAZIL_STATIC' | 'USDA'
  sourceRef?: string | null
  aliases: string[]
}

export interface FoodCatalogRepository {
  findByAlias(alias: string): Promise<FoodCatalogItem | null>
  findById(id: string): Promise<FoodCatalogItem | null>
  findCandidatesByGroup(foodGroup: DietFoodGroup): Promise<FoodCatalogItem[]>
  upsertMany(items: UpsertFoodCatalogInput[]): Promise<void>
}
