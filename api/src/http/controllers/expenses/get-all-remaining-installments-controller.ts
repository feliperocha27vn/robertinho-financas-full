import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const getAllRemainingInstallmentsController: FastifyPluginAsyncZod =
  async app => {
    app.get(
      '/installments/remaining/all',
      {
        schema: {
          tags: ['Installments'],
          summary: 'Get all remaining installments grouped',
          response: {
            200: z.object({
              installments: z.array(
                z.object({
                  expenseDescription: z.string(),
                  remainingCount: z.number(),
                  installmentValue: z.number(),
                  totalRemaining: z.number(),
                })
              ),
              totalOverallRemaining: z.number(),
            }),
          },
        },
      },
      async (_request, reply) => {
        const data =
          await expensesUseCases.getAllRemainingInstallments.execute()
        return reply.status(200).send(data)
      }
    )
  }
