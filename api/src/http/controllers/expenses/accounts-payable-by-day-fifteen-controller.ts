import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const accountsPayableByDayFifteenController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/expenses/payable/day-fifteen',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Get accounts payable by day 15',
          response: {
            200: z.object({
              totalAmountForPayByDayFifteen: z.number(),
              accountsPayableMonth: z.array(
                z.object({
                  description: z.string(),
                  amount: z.number(),
                })
              ),
            }),
          },
        },
      },
      async (_request, reply) => {
        const data =
          await expensesUseCases.accountsToPayByDayFifteen.execute()
        return reply.status(200).send(data)
      }
    )
  }
