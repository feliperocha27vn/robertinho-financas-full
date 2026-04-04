import type { FoodCatalogRepository } from '../../repositories/contracts/food-catalog-repository'
import type {
  DietFoodItem,
  DietMeal,
  DietMealOption,
  DietRepository,
} from '../../repositories/contracts/diet-repository'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

interface Input {
  userId: string
  query: string
  mealName?: string
  optionLabel?: string
}

export class ResolveDietFoodUseCase {
  constructor(
    private readonly dietRepository: DietRepository,
    private readonly foodCatalogRepository: FoodCatalogRepository
  ) {}

  async execute(input: Input): Promise<{
    meal: DietMeal
    option: DietMealOption
    dietItem: DietFoodItem
    catalogItemId: string | null
  } | null> {
    const plan = await this.dietRepository.getActiveByUserId(input.userId)
    if (!plan) {
      return null
    }

    const normalizedQuery = normalize(input.query)
    const aliasMatch = await this.foodCatalogRepository.findByAlias(input.query)

    const meals = input.mealName
      ? plan.meals.filter(item => normalize(item.name) === normalize(input.mealName ?? ''))
      : plan.meals

    const optionsByMeal = meals.flatMap(meal =>
      (input.optionLabel
        ? meal.options.filter(opt => normalize(opt.label) === normalize(input.optionLabel ?? ''))
        : meal.options
      ).map(option => ({ meal, option }))
    )

    for (const item of optionsByMeal) {
      for (const food of item.option.items) {
        if (food.foodCatalogId && aliasMatch && food.foodCatalogId === aliasMatch.id) {
          return {
            meal: item.meal,
            option: item.option,
            dietItem: food,
            catalogItemId: aliasMatch.id,
          }
        }

        if (food.normalizedName === normalizedQuery) {
          return {
            meal: item.meal,
            option: item.option,
            dietItem: food,
            catalogItemId: food.foodCatalogId,
          }
        }
      }
    }

    return null
  }
}
