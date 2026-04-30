import { makeGetHomeDataUseCase } from '@factories/make-get-home-data-use-case'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getHomeDataController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/summary/home',
    {
      schema: {
        tags: ['Summary'],
        summary: 'Get home dashboard data',
        response: {
          200: z.object({
            balance: z.number(),
            income: z.number(),
            expense: z.number(),
            recentTransactions: z.array(
              z.object({
                id: z.string(),
                description: z.string(),
                amount: z.number(),
                category: z.string(),
                date: z.date(),
              })
            ),
          }),
        },
      },
    },
    async (_request, reply) => {
      const useCase = makeGetHomeDataUseCase()
      const data = await useCase.execute()
      return reply.status(200).send(data)
    }
  )
}
