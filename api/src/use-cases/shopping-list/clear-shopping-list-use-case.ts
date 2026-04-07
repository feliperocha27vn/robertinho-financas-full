import type { ShoppingListRepository } from '../../repositories/contracts/shopping-list-repository'

interface Input {
  userId: string
}

interface Result {
  cleared: number
}

export class ClearShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository
  ) {}

  async execute(input: Input): Promise<Result> {
    const cleared = await this.shoppingListRepository.clearItems(input.userId)

    return {
      cleared,
    }
  }
}
