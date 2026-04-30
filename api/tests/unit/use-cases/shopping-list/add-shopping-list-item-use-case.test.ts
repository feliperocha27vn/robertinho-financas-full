import { describe, expect, it } from 'vitest'
import { InMemoryShoppingListRepository } from '../../../../src/in-memory/in-memory-shopping-list-repository'
import type { AddShoppingListItemInput } from '../../../../src/repositories/contracts/shopping-list-repository'
import { AddShoppingListItemUseCase } from '../../../../src/use-cases/shopping-list/add-shopping-list-item-use-case'

describe('AddShoppingListItemUseCase', () => {
  it('returns invalid_name when item name is blank', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    const sut = new AddShoppingListItemUseCase(shoppingListRepository)

    const result = await sut.execute({ userId: 'u1', name: '   ' })

    expect(result).toEqual({ status: 'invalid_name' })
  })

  it('returns created when item is new', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    const sut = new AddShoppingListItemUseCase(shoppingListRepository)

    const result = await sut.execute({ userId: 'u1', name: 'Cafe' })

    expect(result.status).toBe('created')
    if (result.status === 'created') {
      expect(result.item).toMatchObject({
        userId: 'u1',
        name: 'Cafe',
      })
    }
  })

  it('trims item name before calling repository', async () => {
    const addItemInputs: AddShoppingListItemInput[] = []
    const shoppingListRepository = {
      addItem: async (input: AddShoppingListItemInput) => {
        addItemInputs.push(input)

        return {
          created: true,
          item: {
            id: 'item-1',
            userId: input.userId,
            name: input.name,
            createdAt: new Date(),
          },
        }
      },
      listItems: async () => [],
      clearItems: async () => 0,
    }
    const sut = new AddShoppingListItemUseCase(shoppingListRepository)

    await sut.execute({ userId: 'u1', name: '  Cafe  ' })

    expect(addItemInputs).toHaveLength(1)
    expect(addItemInputs[0]).toEqual({
      userId: 'u1',
      name: 'Cafe',
    })
  })

  it('returns already_exists for duplicate item', async () => {
    const shoppingListRepository = new InMemoryShoppingListRepository()
    const sut = new AddShoppingListItemUseCase(shoppingListRepository)

    const firstResult = await sut.execute({ userId: 'u1', name: 'Cafe' })
    const result = await sut.execute({ userId: 'u1', name: 'cafe' })

    expect(result.status).toBe('already_exists')
    if (
      result.status === 'already_exists' &&
      firstResult.status === 'created'
    ) {
      expect(result.item).toMatchObject({
        id: firstResult.item.id,
        userId: 'u1',
        name: 'Cafe',
      })
    }
  })
})
