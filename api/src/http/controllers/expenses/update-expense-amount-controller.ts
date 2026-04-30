import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const updateExpenseAmountController: FastifyPluginAsyncZod =
  async app => {
    app.patch(
      '/expenses/amount',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Update expense amount by name',
          body: z.object({
            nameExpense: z.string().min(1),
            amount: z.coerce.number().positive(),
          }),
          response: {
            200: z.object({
              status: z.string(),
              description: z.string().optional(),
              oldAmount: z.number().optional(),
              newAmount: z.number().optional(),
              options: z.array(z.string()).optional(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { nameExpense, amount } = request.body
        const data = await expensesUseCases.updateExpenseAmount.execute({
          nameExpense,
          amount,
        })
        return reply.status(200).send(data)
      }
    )
  }
