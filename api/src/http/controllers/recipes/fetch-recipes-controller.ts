import { repositories } from '@factories/make-repositories'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const fetchRecipesController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/recipes',
    {
      schema: {
        tags: ['Recipes'],
        summary: 'List all recipes',
        querystring: z.object({
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({
            recipes: z.array(
              z.object({
                id: z.string().uuid(),
                description: z.string(),
                amount: z.number(),
                createdAt: z.date(),
              })
            ),
            nextCursor: z.string().optional(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const items = await repositories.recipes.findAll()
      return reply.status(200).send({ recipes: items })
    }
  )
}
