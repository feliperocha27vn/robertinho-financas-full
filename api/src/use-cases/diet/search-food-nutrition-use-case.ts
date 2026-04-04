import type {
  FoodNutritionResult,
  NutritionProvider,
} from '../../providers/nutrition/nutrition-provider'
import type { FoodCatalogRepository } from '../../repositories/contracts/food-catalog-repository'

interface Input {
  query: string
  amount?: number
  unit?: string
}

export class SearchFoodNutritionUseCase {
  constructor(
    private readonly foodCatalogRepository: FoodCatalogRepository,
    private readonly nutritionProvider: NutritionProvider
  ) {}

  async execute(input: Input): Promise<FoodNutritionResult | null> {
    const query = input.query.trim()
    if (!query) {
      return null
    }

    const catalogItem = await this.foodCatalogRepository.findByAlias(query)
    if (catalogItem) {
      return {
        displayName: catalogItem.canonicalName,
        normalizedName: catalogItem.normalizedName,
        amount: input.amount ?? catalogItem.baseAmount,
        unit: input.unit ?? catalogItem.baseUnit,
        calories: catalogItem.calories,
        protein: catalogItem.protein,
        carbs: catalogItem.carbs,
        fat: catalogItem.fat,
        fiber: catalogItem.fiber,
        foodGroup: catalogItem.foodGroup,
        sourceType: 'CATALOG',
        sourceRef: catalogItem.sourceRef,
        confidence: 'high',
      }
    }

    return this.nutritionProvider.searchFood({
      query,
      amount: input.amount,
      unit: input.unit,
    })
  }
}
