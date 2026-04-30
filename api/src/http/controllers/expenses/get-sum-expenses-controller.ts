import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getSumExpensesController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/expenses/sum',
    {
      schema: {
        tags: ['Expenses'],
        summary: 'Get total sum of all expenses',
        response: {
          200: z.object({
            totalExpenses: z.string(),
            items: z.array(
              z.object({
                description: z.string(),
                amount: z.number(),
                numberOfInstallments: z.number().nullable(),
              })
            ),
          }),
        },
      },
    },
    async (_request, reply) => {
      const data = await expensesUseCases.getSumExpenses.execute()
      return reply.status(200).send(data)
    }
  )
}
