import { randomUUID } from 'node:crypto'
import type { ShoppingListItem } from '../lib/types'
import type {
  AddShoppingListItemInput,
  AddShoppingListItemResult,
  ShoppingListRepository,
} from '../repositories/contracts/shopping-list-repository'
import { normalizeShoppingListName } from '../utils/normalize-shopping-list-name'

export class InMemoryShoppingListRepository implements ShoppingListRepository {
  public items: ShoppingListItem[] = []

  async addItem(
    input: AddShoppingListItemInput
  ): Promise<AddShoppingListItemResult> {
    const normalized = normalizeShoppingListName(input.name)
    const found = this.items.find(
      item =>
        item.userId === input.userId &&
        normalizeShoppingListName(item.name) === normalized
    )

    if (found) {
      return {
        created: false,
        item: found,
      }
    }

    const item: ShoppingListItem = {
      id: randomUUID(),
      userId: input.userId,
      name: input.name.trim(),
      createdAt: new Date(),
    }

    this.items.push(item)

    return {
      created: true,
      item,
    }
  }

  async listItems(userId: string): Promise<ShoppingListItem[]> {
    return this.items
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async clearItems(userId: string): Promise<number> {
    const before = this.items.length
    this.items = this.items.filter(item => item.userId !== userId)
    return before - this.items.length
  }
}
