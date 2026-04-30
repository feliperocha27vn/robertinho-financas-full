import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const deleteAllVariableExpensesController: FastifyPluginAsyncZod =
  async app => {
    app.delete(
      '/expenses/variables',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Delete all variable expenses of current month',
          response: {
            200: z.object({
              deletedCount: z.number(),
              totalDeleted: z.number(),
            }),
          },
        },
      },
      async (_request, reply) => {
        const data =
          await expensesUseCases.deleteAllVariableExpensesCurrentMonth.execute()
        return reply.status(200).send(data)
      }
    )
  }
