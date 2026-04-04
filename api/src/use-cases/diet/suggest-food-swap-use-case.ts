import type { DietRepository } from '../../repositories/contracts/diet-repository'
import type { SearchFoodNutritionUseCase } from './search-food-nutrition-use-case'

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
  sourceType: 'BRAZIL_STATIC' | 'USDA'
  sourceRef: string | null
  confidence: 'high' | 'medium' | 'low'
  calorieDelta: number
}

const FOOD_SYNONYMS: Record<string, string[]> = {
  'banana media': ['maca', 'pera', 'goiaba', 'mamao'],
  banana: ['maca', 'pera', 'goiaba', 'mamao'],
  'peito de frango': ['tilapia', 'patinho moido', 'alcatra magra'],
  frango: ['tilapia', 'patinho moido', 'alcatra magra'],
  'arroz branco cozido': ['mandioca cozida', 'batata inglesa cozida', 'inhame cozido'],
  arroz: ['mandioca cozida', 'batata inglesa cozida', 'inhame cozido'],
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export class SuggestFoodSwapUseCase {
  constructor(
    private readonly dietRepository: DietRepository,
    private readonly searchFoodNutritionUseCase: SearchFoodNutritionUseCase
  ) {}

  async execute(input: Input): Promise<{
    originalFood: {
      name: string
      estimatedCalories: number | null
      foodGroup: string
    }
    suggestions: SuggestionItem[]
  }> {
    const plan = await this.dietRepository.getActiveByUserId(input.userId)
    if (!plan) {
      return {
        originalFood: {
          name: input.originalFoodName,
          estimatedCalories: null,
          foodGroup: 'OTHER',
        },
        suggestions: [],
      }
    }

    const normalizedOriginal = normalize(input.originalFoodName)
    const meals = input.mealName
      ? plan.meals.filter(item => normalize(item.name) === normalize(input.mealName ?? ''))
      : plan.meals

    const options = meals.flatMap(meal =>
      input.optionLabel
        ? meal.options.filter(opt => normalize(opt.label) === normalize(input.optionLabel ?? ''))
        : meal.options
    )

    const originalItem = options
      .flatMap(option => option.items)
      .find(item => normalize(item.name) === normalizedOriginal)

    if (!originalItem) {
      return {
        originalFood: {
          name: input.originalFoodName,
          estimatedCalories: null,
          foodGroup: 'OTHER',
        },
        suggestions: [],
      }
    }

    const caloriesBase = originalItem.estimatedCalories ?? 0
    const synonyms = FOOD_SYNONYMS[normalizedOriginal] ?? []

    const candidates = await Promise.all(
      synonyms.map(query => this.searchFoodNutritionUseCase.execute({ query }))
    )

    const suggestions = candidates
      .filter(item => item !== null)
      .filter(item => item.foodGroup === originalItem.foodGroup)
      .map(item => ({
        ...item,
        calorieDelta: (item.calories ?? 0) - caloriesBase,
      }))
      .filter(item => Math.abs(item.calorieDelta) <= 30)
      .slice(0, 4)

    return {
      originalFood: {
        name: originalItem.name,
        estimatedCalories: originalItem.estimatedCalories,
        foodGroup: originalItem.foodGroup,
      },
      suggestions,
    }
  }
}
