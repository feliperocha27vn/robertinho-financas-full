import { describe, expect, it } from 'vitest'
import { SuggestFoodSwapUseCase } from '../../../../src/use-cases/diet/suggest-food-swap-use-case'

describe('SuggestFoodSwapUseCase', () => {
  it('suggests same-group foods within calorie tolerance', async () => {
    const dietRepository = {
      getActiveByUserId: async () => ({
        id: 'plan-1',
        userId: 'user-1',
        title: 'Dieta',
        targetCalories: 2200,
        meals: [
          {
            id: 'meal-1',
            name: 'Refeicao 1',
            timeLabel: '07:00',
            displayOrder: 1,
            options: [
              {
                id: 'opt-1',
                label: 'Opcao 1',
                items: [
                  {
                    id: 'item-1',
                    name: 'banana media',
                    normalizedName: 'banana media',
                    amount: 1,
                    unit: 'unidade',
                    estimatedCalories: 90,
                    foodGroup: 'FRUIT',
                    notes: null,
                  },
                ],
              },
            ],
          },
        ],
      }),
    }

    const searchFoodNutritionUseCase = {
      execute: async (input: { query: string }) => {
        const table: Record<string, any> = {
          maca: {
            displayName: 'Maca',
            normalizedName: 'maca',
            calories: 84,
            protein: 0.3,
            carbs: 22,
            fat: 0.2,
            fiber: 2,
            amount: 1,
            unit: 'unidade',
            foodGroup: 'FRUIT',
            sourceType: 'BRAZIL_STATIC',
            sourceRef: 'TACO',
            confidence: 'high',
          },
          pera: {
            displayName: 'Pera',
            normalizedName: 'pera',
            calories: 96,
            protein: 0.4,
            carbs: 26,
            fat: 0.2,
            fiber: 3,
            amount: 1,
            unit: 'unidade',
            foodGroup: 'FRUIT',
            sourceType: 'BRAZIL_STATIC',
            sourceRef: 'TACO',
            confidence: 'high',
          },
          arroz: {
            displayName: 'Arroz',
            normalizedName: 'arroz',
            calories: 128,
            protein: 2,
            carbs: 28,
            fat: 0.2,
            fiber: 1,
            amount: 100,
            unit: 'g',
            foodGroup: 'CARB',
            sourceType: 'BRAZIL_STATIC',
            sourceRef: 'TACO',
            confidence: 'high',
          },
        }

        return table[input.query] ?? null
      },
    }

    const sut = new SuggestFoodSwapUseCase(
      dietRepository as any,
      searchFoodNutritionUseCase as any
    )

    const result = await sut.execute({
      userId: 'user-1',
      originalFoodName: 'banana media',
    })

    expect(result.originalFood.name).toBe('banana media')
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.suggestions.every(item => item.foodGroup === 'FRUIT')).toBe(
      true
    )
    expect(
      result.suggestions.every(item => Math.abs(item.calorieDelta) <= 30)
    ).toBe(true)
  })
})
