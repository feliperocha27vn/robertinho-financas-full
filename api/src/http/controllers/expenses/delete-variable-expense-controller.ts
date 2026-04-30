import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const deleteVariableExpenseController: FastifyPluginAsyncZod =
  async app => {
    app.delete(
      '/expenses/variable',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Delete variable expense by name (current month only)',
          body: z.object({
            nameExpense: z.string().min(1),
            selectedExpenseId: z.string().uuid().optional(),
          }),
          response: {
            200: z.object({
              status: z.string(),
              deleted: z
                .object({
                  id: z.string(),
                  description: z.string(),
                  amount: z.number(),
                })
                .optional(),
              options: z
                .array(
                  z.object({
                    id: z.string(),
                    description: z.string(),
                    amount: z.number(),
                  })
                )
                .optional(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { nameExpense, selectedExpenseId } = request.body
        const data = await expensesUseCases.deleteVariableExpenseByName.execute(
          {
            nameExpense,
            selectedExpenseId,
          }
        )
        return reply.status(200).send(data)
      }
    )
  }
