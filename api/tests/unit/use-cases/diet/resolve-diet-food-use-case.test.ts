import { describe, expect, it } from 'vitest'
import { InMemoryDietRepository } from '../../../../src/repositories/in-memory/in-memory-diet-repository'
import { InMemoryFoodCatalogRepository } from '../../../../src/repositories/in-memory/in-memory-food-catalog-repository'
import { ResolveDietFoodUseCase } from '../../../../src/use-cases/diet/resolve-diet-food-use-case'

describe('ResolveDietFoodUseCase', () => {
  it('matches alias query to catalog-linked diet item', async () => {
    const dietRepository = new InMemoryDietRepository()
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
        aliases: ['banana', 'banana media', 'banana prata'],
      },
    ])

    const banana = await foodCatalogRepository.findByAlias('banana')

    await dietRepository.replaceActivePlan({
      userId: 'user-1',
      title: 'Dieta',
      meals: [
        {
          name: 'Refeicao 1',
          options: [
            {
              label: 'Opcao 1',
              items: [
                {
                  name: 'banana media',
                  foodCatalogId: banana?.id,
                  estimatedCalories: 90,
                  foodGroup: 'FRUIT',
                },
              ],
            },
          ],
        },
      ],
    })

    const sut = new ResolveDietFoodUseCase(dietRepository, foodCatalogRepository)
    const result = await sut.execute({ userId: 'user-1', query: 'banana' })

    expect(result).not.toBeNull()
    expect(result?.dietItem.name).toBe('banana media')
    expect(result?.catalogItemId).toBe(banana?.id ?? null)
  })
})
