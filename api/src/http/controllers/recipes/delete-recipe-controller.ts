import { repositories } from '@factories/make-repositories'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const deleteRecipeController: FastifyPluginAsyncZod = async app => {
  app.delete(
    '/recipes/:id',
    {
      schema: {
        tags: ['Recipes'],
        summary: 'Delete a recipe',
        params: z.object({ id: z.string().uuid() }),
        response: {
          204: z.void(),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const existing = await repositories.recipes.findById(id)
      if (!existing) {
        return reply.status(404).send({ message: 'Recipe not found' })
      }

      await repositories.recipes.delete(id)
      return reply.status(204).send()
    }
  )
}
