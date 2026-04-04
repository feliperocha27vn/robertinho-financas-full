import { describe, expect, it } from 'vitest'
import { InMemoryFoodCatalogRepository } from '../../../../src/repositories/in-memory/in-memory-food-catalog-repository'
import { ResolveDietFoodUseCase } from '../../../../src/use-cases/diet/resolve-diet-food-use-case'
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
                    foodCatalogId: null,
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

    const foodCatalogRepository = new InMemoryFoodCatalogRepository()
    await foodCatalogRepository.upsertMany([
      {
        canonicalName: 'banana prata',
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
        aliases: ['banana', 'banana media'],
      },
      {
        canonicalName: 'maca',
        foodGroup: 'FRUIT',
        baseAmount: 100,
        baseUnit: 'g',
        calories: 84,
        protein: 0.3,
        carbs: 22,
        fat: 0.2,
        fiber: 2,
        sourceType: 'CATALOG',
        sourceRef: 'seed:v1',
        aliases: ['maca'],
      },
      {
        canonicalName: 'pera',
        foodGroup: 'FRUIT',
        baseAmount: 100,
        baseUnit: 'g',
        calories: 96,
        protein: 0.4,
        carbs: 26,
        fat: 0.2,
        fiber: 3,
        sourceType: 'CATALOG',
        sourceRef: 'seed:v1',
        aliases: ['pera'],
      },
      {
        canonicalName: 'arroz branco cozido',
        foodGroup: 'CARB',
        baseAmount: 100,
        baseUnit: 'g',
        calories: 128,
        protein: 2.5,
        carbs: 28.1,
        fat: 0.2,
        fiber: 1.6,
        sourceType: 'CATALOG',
        sourceRef: 'seed:v1',
        aliases: ['arroz'],
      },
    ])

    const banana = await foodCatalogRepository.findByAlias('banana')
    if (!banana) {
      throw new Error('banana catalog item must exist in test setup')
    }

    ;(dietRepository.getActiveByUserId as any) = async () => ({
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
                  foodCatalogId: banana.id,
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
    })

    const resolveDietFoodUseCase = new ResolveDietFoodUseCase(
      dietRepository as any,
      foodCatalogRepository
    )

    const sut = new SuggestFoodSwapUseCase(
      foodCatalogRepository,
      resolveDietFoodUseCase
    )

    const result = await sut.execute({
      userId: 'user-1',
      originalFoodName: 'banana',
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
