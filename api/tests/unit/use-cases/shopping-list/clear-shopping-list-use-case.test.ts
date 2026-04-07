import { describe, expect, it } from 'vitest'
import { InMemoryShoppingListRepository } from '../../../../src/repositories/in-memory/in-memory-shopping-list-repository'
import { ClearShoppingListUseCase } from '../../../../src/use-cases/shopping-list/clear-shopping-list-use-case'

describe('ClearShoppingListUseCase', () => {
  it('returns cleared count for user items', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    await shoppingListRepository.addItem({ userId: 'u1', name: 'Cafe' })
    await shoppingListRepository.addItem({ userId: 'u1', name: 'Leite' })
    await shoppingListRepository.addItem({ userId: 'u2', name: 'Arroz' })
    const sut = new ClearShoppingListUseCase(shoppingListRepository)

    const result = await sut.execute({ userId: 'u1' })

    expect(result).toEqual({ cleared: 2 })
    expect(await shoppingListRepository.listItems('u1')).toHaveLength(0)
    expect(await shoppingListRepository.listItems('u2')).toHaveLength(1)
  })

  it('returns zero when user list is already empty', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    await shoppingListRepository.addItem({ userId: 'u2', name: 'Arroz' })
    const sut = new ClearShoppingListUseCase(shoppingListRepository)

    const result = await sut.execute({ userId: 'u1' })

    expect(result).toEqual({ cleared: 0 })
    expect(await shoppingListRepository.listItems('u2')).toHaveLength(1)
  })
})
