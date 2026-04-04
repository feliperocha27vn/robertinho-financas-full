import type {
  FoodNutritionResult,
  NutritionProvider,
} from '../../providers/nutrition/nutrition-provider'

interface Input {
  query: string
  amount?: number
  unit?: string
}

export class SearchFoodNutritionUseCase {
  constructor(private readonly nutritionProvider: NutritionProvider) {}

  async execute(input: Input): Promise<FoodNutritionResult | null> {
    const query = input.query.trim()
    if (!query) {
      return null
    }

    return this.nutritionProvider.searchFood({
      query,
      amount: input.amount,
      unit: input.unit,
    })
  }
}
