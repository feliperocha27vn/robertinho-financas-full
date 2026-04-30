import { repositories } from '@factories/make-repositories'
import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const updateRecipeController: FastifyPluginAsyncZod = async app => {
  app.put(
    '/recipes/:id',
    {
      schema: {
        tags: ['Recipes'],
        summary: 'Update a recipe',
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          description: z.string().min(1),
          amount: z.coerce.number().positive(),
        }),
        response: {
          200: z.object({
            recipe: z.object({
              id: z.string().uuid(),
              description: z.string(),
              amount: z.number(),
              createdAt: z.date(),
            }),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { description, amount } = request.body

      const existing = await repositories.recipes.findById(id)
      if (!existing) {
        return reply
          .status(404)
          .send({ message: 'Recipe not found' })
      }

      const recipe = await repositories.recipes.update(id, {
        description,
        amount,
      })

      return reply.status(200).send({ recipe })
    }
  )
}
