import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const payAllUnpaidController: FastifyPluginAsyncZod = async app => {
  app.patch(
    '/expenses/pay-all-unpaid',
    {
      schema: {
        tags: ['Expenses'],
        summary: 'Pay all unpaid expenses of current month',
        response: {
          200: z.object({
            success: z.boolean(),
            paidCount: z.number(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const data =
        await expensesUseCases.payAllUnpaidCurrentMonth.execute()
      return reply.status(200).send(data)
    }
  )
}
