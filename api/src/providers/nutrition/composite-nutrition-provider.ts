import type {
  FoodNutritionLookup,
  FoodNutritionResult,
  NutritionProvider,
} from './nutrition-provider'

export class CompositeNutritionProvider implements NutritionProvider {
  constructor(private readonly providers: NutritionProvider[]) {}

  async searchFood(
    input: FoodNutritionLookup
  ): Promise<FoodNutritionResult | null> {
    for (const provider of this.providers) {
      const result = await provider.searchFood(input)
      if (result) {
        return result
      }
    }

    return null
  }
}
