import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getContainer } from '../../container'

export const accountsPayableNextMonthController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/expenses/accounts-payable-by-day-fifteen',
      {
        schema: {
          response: {
            200: z.object({
              totalAmountForPayByDayFifteen: z.number().min(0),
            }),
          },
        },
      },
      async (_, reply) => {
        try {
          const { totalAmountForPayByDayFifteen } =
            await getContainer().accountsToPayByDayFifteen.execute()

          return reply.status(200).send({ totalAmountForPayByDayFifteen })
        } catch (error) {
          console.error(error)
          throw error
        }
      }
    )
  }
