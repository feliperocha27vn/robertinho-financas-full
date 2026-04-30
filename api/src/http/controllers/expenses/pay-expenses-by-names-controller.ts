import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const payExpensesByNamesController: FastifyPluginAsyncZod =
  async app => {
    app.post(
      '/expenses/pay',
      {
        schema: {
          tags: ['Expenses'],
          summary: 'Pay expenses by names',
          body: z.object({
            items: z.array(z.string()),
          }),
          response: {
            200: z.object({
              status: z.string(),
              paidDescriptions: z.array(z.string()).optional(),
              notFound: z.array(z.string()).optional(),
              term: z.string().optional(),
              options: z.array(z.string()).optional(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { items } = request.body
        const data = await expensesUseCases.payExpensesByNames.execute({
          items,
        })
        return reply.status(200).send(data)
      }
    )
  }
