import type { ShoppingListItem } from '../../lib/types'

export interface AddShoppingListItemInput {
  userId: string
  name: string
}

export interface AddShoppingListItemResult {
  created: boolean
  item: ShoppingListItem
}

export interface ShoppingListRepository {
  addItem(input: AddShoppingListItemInput): Promise<AddShoppingListItemResult>
  listItems(userId: string): Promise<ShoppingListItem[]>
  clearItems(userId: string): Promise<number>
}
