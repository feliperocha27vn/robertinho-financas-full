import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getHomeData } from '../../functions/summary/get-home-data'

export const getHomeDataController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/summary/home',
    {
      schema: {
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
    async (_, reply) => {
      try {
        const data = await getHomeData()
        return reply.status(200).send(data)
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  )
}
