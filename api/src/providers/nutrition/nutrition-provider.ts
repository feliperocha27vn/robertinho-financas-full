import type { DietFoodGroup } from '../../repositories/contracts/diet-repository'

export interface FoodNutritionLookup {
  query: string
  amount?: number
  unit?: string
}

export interface FoodNutritionResult {
  displayName: string
  normalizedName: string
  amount: number | null
  unit: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  foodGroup: DietFoodGroup
  sourceType: 'BRAZIL_STATIC' | 'USDA'
  sourceRef: string | null
  confidence: 'high' | 'medium' | 'low'
}

export interface NutritionProvider {
  searchFood(input: FoodNutritionLookup): Promise<FoodNutritionResult | null>
}
