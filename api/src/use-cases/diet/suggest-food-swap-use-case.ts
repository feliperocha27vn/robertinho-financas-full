import type { FoodCatalogRepository } from '../../repositories/contracts/food-catalog-repository'
import type { ResolveDietFoodUseCase } from './resolve-diet-food-use-case'

interface Input {
  userId: string
  mealName?: string
  optionLabel?: string
  originalFoodName: string
}

interface SuggestionItem {
  displayName: string
  normalizedName: string
  amount: number | null
  unit: string | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  foodGroup: string
  sourceType: 'CATALOG' | 'BRAZIL_STATIC' | 'USDA'
  sourceRef: string | null
  confidence: 'high' | 'medium' | 'low'
  calorieDelta: number
}

export class SuggestFoodSwapUseCase {
  constructor(
    private readonly foodCatalogRepository: FoodCatalogRepository,
    private readonly resolveDietFoodUseCase: ResolveDietFoodUseCase
  ) {}

  async execute(input: Input): Promise<{
    originalFood: {
      name: string
      estimatedCalories: number | null
      foodGroup: string
    }
    suggestions: SuggestionItem[]
  }> {
    const resolved = await this.resolveDietFoodUseCase.execute({
      userId: input.userId,
      mealName: input.mealName,
      optionLabel: input.optionLabel,
      query: input.originalFoodName,
    })

    if (!resolved) {
      return {
        originalFood: {
          name: input.originalFoodName,
          estimatedCalories: null,
          foodGroup: 'OTHER',
        },
        suggestions: [],
      }
    }

    const caloriesBase = resolved.dietItem.estimatedCalories ?? 0

    const candidates = await this.foodCatalogRepository.findCandidatesByGroup(
      resolved.dietItem.foodGroup
    )

    const suggestions = candidates
      .filter(item => item.id !== resolved.catalogItemId)
      .map(item => ({
        displayName: item.canonicalName,
        normalizedName: item.normalizedName,
        amount: item.baseAmount,
        unit: item.baseUnit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        foodGroup: item.foodGroup,
        sourceType: 'CATALOG' as const,
        sourceRef: item.sourceRef,
        confidence: 'high' as const,
        calorieDelta: (item.calories ?? 0) - caloriesBase,
      }))
      .filter(item => Math.abs(item.calorieDelta) <= 30)
      .slice(0, 4)

    return {
      originalFood: {
        name: resolved.dietItem.name,
        estimatedCalories: resolved.dietItem.estimatedCalories,
        foodGroup: resolved.dietItem.foodGroup,
      },
      suggestions,
    }
  }
}
