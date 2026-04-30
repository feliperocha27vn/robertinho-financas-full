import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getSumFixedExpensesController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/expenses/sum/fixed',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Get sum of fixed expenses',
          response: {
            200: z.object({
              totalFixedExpenses: z.string(),
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
        const data = await expensesUseCases.getSumExpensesFixed.execute()
        return reply.status(200).send(data)
      }
    )
  }
