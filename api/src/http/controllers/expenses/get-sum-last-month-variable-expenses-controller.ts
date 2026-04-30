import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getSumLastMonthVariableExpensesController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/expenses/sum/variables/last-month',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Get variable expenses of last month',
          response: {
            200: z.object({
              totalExpensesOfLastMonth: z.number(),
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
        const data =
          await expensesUseCases.getSumExpensesOfLastMonthVariables.execute()
        return reply.status(200).send(data)
      }
    )
  }
