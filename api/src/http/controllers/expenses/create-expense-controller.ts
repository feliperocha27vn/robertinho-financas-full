import { expensesUseCases } from '@factories/make-use-cases'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const createExpenseController: FastifyPluginAsyncZod = async app => {
  app.post(
    '/expenses',
    {
      schema: {
        tags: ['Expenses'],
        summary: 'Create a new expense',
        body: z.object({
          description: z.string().min(1),
          amount: z.coerce.number().positive(),
          category: z.enum([
            'TRANSPORT',
            'OTHERS',
            'STUDIES',
            'RESIDENCE',
            'CREDIT',
          ]),
          isFixed: z.boolean().default(false),
        }),
        response: {
          201: z.object({
            expense: z.object({
              id: z.string().uuid(),
              description: z.string(),
              amount: z.number(),
              category: z.enum([
                'TRANSPORT',
                'OTHERS',
                'STUDIES',
                'RESIDENCE',
                'CREDIT',
              ]),
              isFixed: z.boolean(),
              numberOfInstallments: z.number().nullable(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { description, amount, category, isFixed } = request.body

      const data = await expensesUseCases.createExpense.execute({
        description,
        amount,
        category,
        isFixed,
      })

      return reply.status(201).send(data)
    }
  )
}
