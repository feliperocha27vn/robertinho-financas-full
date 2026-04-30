import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getRemainingInstallmentsController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/installments/remaining',
      {
        schema: {
          tags: ['Installments'],
          summary: 'Get remaining installments by expense name',
          querystring: z.object({
            name: z.string(),
          }),
          response: {
            200: z.object({
              remainingInstallments: z.number(),
              found: z.boolean(),
              expenseDescription: z.string().optional(),
              totalRemaining: z.number().optional(),
              valueInstallmentOfExpense: z.number().optional(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { name } = request.query
        const data = await expensesUseCases.getRemainingInstallments.execute({
          nameExpense: name,
        })
        return reply.status(200).send(data)
      }
    )
  }
