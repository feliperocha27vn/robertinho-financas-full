import { shoppingListUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const addShoppingListItemController: FastifyPluginAsyncZod =
  async app => {
    app.post(
      '/shopping-list',
      {
        schema: {
          tags: ['Shopping List'],
          summary: 'Add an item to the shopping list',
          body: z.object({
            name: z.string().min(1),
          }),
          response: {
            201: z.object({
              status: z.enum(['created', 'already_exists']),
              item: z.object({
                id: z.string().uuid(),
                name: z.string(),
                createdAt: z.date(),
              }),
            }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const { name } = request.body

        const result = await shoppingListUseCases.addShoppingListItem.execute({
          userId: 'default',
          name,
        })

        if (result.status === 'invalid_name') {
          return reply.status(400).send({ message: 'Item name is required' })
        }

        return reply.status(201).send({
          status: result.status,
          item: result.item,
        })
      }
    )
  }
