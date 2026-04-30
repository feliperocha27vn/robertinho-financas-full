import { shoppingListUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const fetchShoppingListController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/shopping-list',
      {
        schema: {
          tags: ['Shopping List'],
          summary: 'List all shopping list items',
          response: {
            200: z.object({
              items: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  createdAt: z.date(),
                })
              ),
            }),
          },
        },
      },
      async (_request, reply) => {
        const { items } = await shoppingListUseCases.getShoppingList.execute({
          userId: 'default',
        })
        return reply.status(200).send({ items })
      }
    )
  }
