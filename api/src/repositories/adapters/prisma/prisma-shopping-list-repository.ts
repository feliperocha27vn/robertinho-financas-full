import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { ShoppingListItem } from '../../../lib/types'
import { normalizeShoppingListName } from '../../../utils/normalize-shopping-list-name'
import { withPrismaRetry } from '../../../utils/prisma-retry'
import type {
  AddShoppingListItemInput,
  AddShoppingListItemResult,
  ShoppingListRepository,
} from '../../contracts/shopping-list-repository'

export class PrismaShoppingListRepository implements ShoppingListRepository {
  async addItem(
    input: AddShoppingListItemInput
  ): Promise<AddShoppingListItemResult> {
    const normalizedName = normalizeShoppingListName(input.name)

    try {
      const created = await withPrismaRetry(
        () =>
          prisma.shoppingListItems.create({
            data: {
              userId: input.userId,
              name: input.name.trim(),
              nameNorm: normalizedName,
            },
          }),
        'shoppingListRepository.addItem.create'
      )

      return {
        created: true,
        item: this.toDomain(created),
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await withPrismaRetry(
          () =>
            prisma.shoppingListItems.findUnique({
              where: {
                userId_nameNorm: {
                  userId: input.userId,
                  nameNorm: normalizedName,
                },
              },
            }),
          'shoppingListRepository.addItem.findUnique'
        )

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
    const items = await withPrismaRetry(
      () =>
        prisma.shoppingListItems.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
      'shoppingListRepository.listItems'
    )

    return items.map(item => this.toDomain(item))
  }

  async clearItems(userId: string): Promise<number> {
    const result = await withPrismaRetry(
      () =>
        prisma.shoppingListItems.deleteMany({
          where: { userId },
        }),
      'shoppingListRepository.clearItems'
    )

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
