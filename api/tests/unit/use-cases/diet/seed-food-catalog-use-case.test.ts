import { describe, expect, it } from 'vitest'
import { SeedFoodCatalogUseCase } from '../../../../src/use-cases/diet/seed-food-catalog-use-case'

describe('SeedFoodCatalogUseCase', () => {
  it('loads a medium curated catalog with broad diet coverage', async () => {
    let payload: any[] = []

    const repository = {
      upsertMany: async (items: any[]) => {
        payload = items
      },
    }

    const sut = new SeedFoodCatalogUseCase(repository as any)
    await sut.execute()

    expect(payload.length).toBeGreaterThanOrEqual(35)
    expect(payload.some(item => item.foodGroup === 'FRUIT')).toBe(true)
    expect(payload.some(item => item.foodGroup === 'CARB')).toBe(true)
    expect(payload.some(item => item.foodGroup === 'PROTEIN')).toBe(true)
    expect(payload.some(item => item.foodGroup === 'DAIRY')).toBe(true)
    expect(payload.some(item => item.foodGroup === 'NUT')).toBe(true)
    expect(payload.some(item => item.foodGroup === 'FAT')).toBe(true)
    expect(
      payload.some(
        item => item.canonicalName === 'maca' && item.aliases.includes('maça')
      )
    ).toBe(true)
    expect(payload.every(item => item.sourceType === 'CATALOG')).toBe(true)
    expect(payload.every(item => String(item.sourceRef).includes('tbca-taco'))).toBe(
      true
    )
  })
})
