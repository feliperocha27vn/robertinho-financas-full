import { shoppingListUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const clearShoppingListController: FastifyPluginAsyncZod =
  async app => {
    app.delete(
      '/shopping-list',
      {
        schema: {
          tags: ['Shopping List'],
          summary: 'Clear all shopping list items',
          response: {
            200: z.object({
              cleared: z.number(),
            }),
          },
        },
      },
      async (_request, reply) => {
        const { cleared } =
          await shoppingListUseCases.clearShoppingList.execute({
            userId: 'default',
          })
        return reply.status(200).send({ cleared })
      }
    )
  }
