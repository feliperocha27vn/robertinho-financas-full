import type { FoodCatalogRepository } from '../../repositories/contracts/food-catalog-repository'
import type { ResolveDietFoodUseCase } from './resolve-diet-food-use-case'

interface Input {
  userId: string
  mealName?: string
  optionLabel?: string
  originalFoodName: string
  replacementFoodName?: string
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

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  private distance(a: string, b: string): number {
    if (a === b) return 0
    if (!a.length) return b.length
    if (!b.length) return a.length

    const matrix = Array.from({ length: a.length + 1 }, () =>
      Array.from({ length: b.length + 1 }, () => 0)
    )

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }

    return matrix[a.length][b.length]
  }

  private isTypoMatch(input: string, candidate: string): boolean {
    const maxDistance = input.length <= 4 ? 1 : 2
    return this.distance(input, candidate) <= maxDistance
  }

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

    const candidateItems = candidates.filter(item => item.id !== resolved.catalogItemId)

    let suggestedItems = candidateItems
    const replacementFoodName = input.replacementFoodName?.trim()
    if (replacementFoodName) {
      const exact = await this.foodCatalogRepository.findByAlias(replacementFoodName)
      if (exact && exact.foodGroup === resolved.dietItem.foodGroup) {
        suggestedItems = candidateItems.filter(item => item.id === exact.id)
      } else {
        const normalizedReplacement = this.normalize(replacementFoodName)
        const fuzzy = candidateItems.find(item => {
          const names = [item.canonicalName, ...item.aliases].map(name =>
            this.normalize(name)
          )

          return names.some(name => this.isTypoMatch(normalizedReplacement, name))
        })

        suggestedItems = fuzzy ? [fuzzy] : []
      }
    }

    const suggestions = suggestedItems
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
