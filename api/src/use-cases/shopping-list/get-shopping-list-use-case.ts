import type { ShoppingListItem } from '../../lib/types'
import type { ShoppingListRepository } from '../../repositories/contracts/shopping-list-repository'

interface Input {
  userId: string
}

interface Result {
  items: ShoppingListItem[]
}

export class GetShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository
  ) {}

  async execute(input: Input): Promise<Result> {
    const items = await this.shoppingListRepository.listItems(input.userId)

    const sortedItems = [...items].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return {
      items: sortedItems,
    }
  }
}
