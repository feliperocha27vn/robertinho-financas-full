import { describe, expect, it, vi } from 'vitest'
import { SearchFoodNutritionUseCase } from '../../../../src/use-cases/diet/search-food-nutrition-use-case'

describe('SearchFoodNutritionUseCase', () => {
  it('returns null when query is empty', async () => {
    const provider = {
      searchFood: vi.fn(),
    }
    const sut = new SearchFoodNutritionUseCase(provider)

    const result = await sut.execute({ query: '   ' })

    expect(result).toBeNull()
    expect(provider.searchFood).not.toHaveBeenCalled()
  })

  it('delegates normalized query to nutrition provider', async () => {
    const catalogRepository = {
      findByAlias: vi.fn().mockResolvedValue(null),
    }
    const provider = {
      searchFood: vi.fn().mockResolvedValue({
        displayName: 'Banana prata',
        normalizedName: 'banana prata',
        amount: 100,
        unit: 'g',
        calories: 98,
        protein: 1.3,
        carbs: 26,
        fat: 0.1,
        fiber: 2.0,
        foodGroup: 'FRUIT',
        sourceType: 'BRAZIL_STATIC',
        sourceRef: 'TACO',
        confidence: 'high',
      }),
    }

    const sut = new SearchFoodNutritionUseCase(catalogRepository as any, provider)
    const result = await sut.execute({ query: ' banana prata ' })

    expect(provider.searchFood).toHaveBeenCalledWith({
      query: 'banana prata',
      amount: undefined,
      unit: undefined,
    })
    expect(result?.displayName).toBe('Banana prata')
  })

  it('returns catalog nutrition before provider fallback', async () => {
    const catalogRepository = {
      findByAlias: vi.fn().mockResolvedValue({
        id: 'food-1',
        canonicalName: 'banana prata',
        normalizedName: 'banana prata',
        foodGroup: 'FRUIT',
        baseAmount: 100,
        baseUnit: 'g',
        calories: 98,
        protein: 1.3,
        carbs: 26,
        fat: 0.1,
        fiber: 2,
        sourceType: 'CATALOG',
        sourceRef: 'seed:v1',
        aliases: ['banana'],
      }),
    }

    const provider = {
      searchFood: vi.fn(),
    }

    const sut = new SearchFoodNutritionUseCase(catalogRepository as any, provider)
    const result = await sut.execute({ query: 'banana' })

    expect(result?.sourceType).toBe('CATALOG')
    expect(provider.searchFood).not.toHaveBeenCalled()
  })
})
