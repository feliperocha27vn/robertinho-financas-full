import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import { repositories } from '@factories/make-repositories'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getRecipeController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/recipes/:id',
    {
      schema: {
        tags: ['Recipes'],
        summary: 'Get a recipe by ID',
        params: z.object({ id: z.string().uuid() }),
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

      const recipe = await repositories.recipes.findById(id)

      if (!recipe) {
        return reply.status(404).send({ message: 'Recipe not found' })
      }

      return reply.status(200).send({ recipe })
    }
  )
}
