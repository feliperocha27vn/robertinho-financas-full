import type { ShoppingListItem } from '../../domain/finance'
import type { ShoppingListRepository } from '../../repositories/contracts/shopping-list-repository'

interface Input {
  userId: string
  name: string
}

type Result =
  | { status: 'invalid_name' }
  | { status: 'created'; item: ShoppingListItem }
  | { status: 'already_exists'; item: ShoppingListItem }

export class AddShoppingListItemUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository
  ) {}

  async execute(input: Input): Promise<Result> {
    const trimmedName = input.name.trim()

    if (!trimmedName) {
      return { status: 'invalid_name' }
    }

    const { created, item } = await this.shoppingListRepository.addItem({
      userId: input.userId,
      name: trimmedName,
    })

    if (!created) {
      return {
        status: 'already_exists',
        item,
      }
    }

    return {
      status: 'created',
      item,
    }
  }
}
