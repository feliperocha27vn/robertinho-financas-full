import { recipesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const createRecipeController: FastifyPluginAsyncZod = async app => {
  app.post(
    '/recipes',
    {
      schema: {
        tags: ['Recipes'],
        summary: 'Create a new recipe (income)',
        body: z.object({
          description: z.string().min(1),
          amount: z.coerce.number().positive(),
        }),
        response: {
          201: z.object({
            recipe: z.object({
              id: z.string().uuid(),
              description: z.string(),
              amount: z.number(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { description, amount } = request.body
      const data = await recipesUseCases.createRecipe.execute({
        description,
        amount,
      })
      return reply.status(201).send(data)
    }
  )
}
