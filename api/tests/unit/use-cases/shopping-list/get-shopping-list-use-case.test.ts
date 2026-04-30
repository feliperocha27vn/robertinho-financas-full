import { describe, expect, it } from 'vitest'
import { InMemoryShoppingListRepository } from '../../../../src/in-memory/in-memory-shopping-list-repository'
import { GetShoppingListUseCase } from '../../../../src/use-cases/shopping-list/get-shopping-list-use-case'

describe('GetShoppingListUseCase', () => {
  it('returns empty list for user without items', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    const sut = new GetShoppingListUseCase(shoppingListRepository)

    const result = await sut.execute({ userId: 'u1' })

    expect(result).toEqual({ items: [] })
  })

  it('returns only user items', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    await shoppingListRepository.addItem({ userId: 'u1', name: 'Cafe' })
    await shoppingListRepository.addItem({ userId: 'u2', name: 'Leite' })
    const sut = new GetShoppingListUseCase(shoppingListRepository)

    const result = await sut.execute({ userId: 'u1' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      userId: 'u1',
      name: 'Cafe',
    })
  })

  it('returns items sorted by createdAt in descending order', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    const sut = new GetShoppingListUseCase(shoppingListRepository)

    await shoppingListRepository.addItem({ userId: 'u1', name: 'Cafe' })
    await shoppingListRepository.addItem({ userId: 'u1', name: 'Leite' })

    shoppingListRepository.items[0]!.createdAt = new Date(
      '2026-01-01T10:00:00.000Z'
    )
    shoppingListRepository.items[1]!.createdAt = new Date(
      '2026-01-01T12:00:00.000Z'
    )

    const result = await sut.execute({ userId: 'u1' })

    expect(result.items).toHaveLength(2)
    expect(result.items[0]?.name).toBe('Leite')
    expect(result.items[1]?.name).toBe('Cafe')
    expect(result.items[0]?.createdAt.getTime()).toBeGreaterThanOrEqual(
      result.items[1]?.createdAt.getTime() ?? 0
    )
  })
})
