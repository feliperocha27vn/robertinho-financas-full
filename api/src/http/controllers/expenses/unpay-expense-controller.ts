import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const unpayExpenseController: FastifyPluginAsyncZod = async app => {
  app.post(
    '/expenses/unpay',
    {
      schema: {
        tags: ['Expenses'],
        summary: 'Unpay an expense by name',
        body: z.object({
          nameExpense: z.string().min(1),
        }),
        response: {
          200: z.object({
            found: z.boolean(),
            success: z.boolean().optional(),
            alreadyUnpaid: z.boolean().optional(),
            expenseDescription: z.string().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { nameExpense } = request.body
      const data = await expensesUseCases.unpayExpense.execute({
        nameExpense,
      })
      return reply.status(200).send(data)
    }
  )
}
