import { Prisma } from '@prisma/client'
import type { ShoppingListItem } from '../../domain/finance'
import { prisma } from '../../lib/prisma'
import { normalizeShoppingListName } from '../shared/normalize-shopping-list-name'
import type {
  AddShoppingListItemInput,
  AddShoppingListItemResult,
  ShoppingListRepository,
} from '../contracts/shopping-list-repository'

export class PrismaShoppingListRepository implements ShoppingListRepository {
  async addItem(
    input: AddShoppingListItemInput
  ): Promise<AddShoppingListItemResult> {
    const normalizedName = normalizeShoppingListName(input.name)

    try {
      const created = await prisma.shoppingListItems.create({
        data: {
          userId: input.userId,
          name: input.name.trim(),
          nameNorm: normalizedName,
        },
      })

      return {
        created: true,
        item: this.toDomain(created),
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await prisma.shoppingListItems.findUnique({
          where: {
            userId_nameNorm: {
              userId: input.userId,
              nameNorm: normalizedName,
            },
          },
        })

        if (!existing) {
          throw error
        }

        return {
          created: false,
          item: this.toDomain(existing),
        }
      }

      throw error
    }
  }

  async listItems(userId: string): Promise<ShoppingListItem[]> {
    const items = await prisma.shoppingListItems.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return items.map(item => this.toDomain(item))
  }

  async clearItems(userId: string): Promise<number> {
    const result = await prisma.shoppingListItems.deleteMany({
      where: { userId },
    })

    return result.count
  }

  private toDomain(item: {
    id: string
    userId: string
    name: string
    createdAt: Date
  }): ShoppingListItem {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      createdAt: item.createdAt,
    }
  }
}
