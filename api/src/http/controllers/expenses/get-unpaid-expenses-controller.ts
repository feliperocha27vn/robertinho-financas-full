import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getUnpaidExpensesController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/expenses/unpaid',
    {
      schema: {
        tags: ['Expenses'],
        summary: 'Get unpaid expenses of current month',
        response: {
          200: z.object({
            unpaidExpenses: z.array(
              z.object({
                description: z.string(),
                amount: z.number(),
              })
            ),
            totalUnpaidAmount: z.number(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const data =
        await expensesUseCases.getUnpaidExpensesOfCurrentMonth.execute()
      return reply.status(200).send(data)
    }
  )
}
