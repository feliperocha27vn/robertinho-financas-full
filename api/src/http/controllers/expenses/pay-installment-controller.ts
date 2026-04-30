import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const payInstallmentController: FastifyPluginAsyncZod = async app => {
  app.post(
    '/installments/pay',
    {
      schema: {
        tags: ['Installments'],
        summary: 'Pay next installment of an expense by name',
        body: z.object({
          nameExpense: z.string().min(1),
        }),
        response: {
          200: z.object({
            found: z.boolean(),
            success: z.boolean().optional(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { nameExpense } = request.body
        const data = await expensesUseCases.payInstallment.execute({
          nameExpense,
        })
        return reply.status(200).send(data)
      } catch (error) {
        if (error instanceof ResourceNotFoundError) {
          return reply.status(404).send({ message: 'Installment not found' })
        }
        throw error
      }
    }
  )
}
