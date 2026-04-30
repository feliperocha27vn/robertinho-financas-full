import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getAccountsPayableController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/expenses/payable',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Get accounts payable for next month',
          response: {
            200: z.object({
              accountsPayableNextMonth: z.array(
                z.object({
                  description: z.string(),
                  amount: z.number(),
                })
              ),
              totalAmountForPayableNextMonth: z.number(),
            }),
          },
        },
      },
      async (_request, reply) => {
        const data = await expensesUseCases.accountsPayableNextMonth.execute()
        return reply.status(200).send(data)
      }
    )
  }
