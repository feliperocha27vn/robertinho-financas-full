import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getContainer } from '../../container'
import { verifyMobileAppToken } from './verify-mobile-app-token'

const transactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  date: z.date(),
})

const accountsPayableSchema = z.object({
  description: z.string(),
  amount: z.number(),
})

const remainingInstallmentSchema = z.object({
  expenseDescription: z.string(),
  remainingCount: z.number(),
  installmentValue: z.number(),
  totalRemaining: z.number(),
})

const summarySchema = z.object({
  balance: z.number(),
  income: z.number(),
  expense: z.number(),
  recentTransactions: z.array(transactionSchema),
})

const accountsToPaySchema = z.object({
  accountsPayableMonth: z.array(accountsPayableSchema),
  totalAmountForPayByDayFifteen: z.number(),
})

const remainingInstallmentsSchema = z.object({
  installments: z.array(remainingInstallmentSchema),
  totalOverallRemaining: z.number(),
})

const overviewSchema = z.object({
  summary: summarySchema,
  accountsPayableByDayFifteen: accountsToPaySchema,
  remainingInstallments: remainingInstallmentsSchema,
})

export const mobileRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyMobileAppToken)

  app.get(
    '/mobile/overview',
    {
      schema: {
        response: {
          200: overviewSchema,
        },
      },
    },
    async (_, reply) => {
      const data = await getContainer().getMobileOverview.execute()
      return reply.status(200).send(data)
    }
  )

  app.get(
    '/mobile/summary',
    {
      schema: {
        response: {
          200: summarySchema,
        },
      },
    },
    async (_, reply) => {
      const data = await getContainer().getHomeData.execute()
      return reply.status(200).send(data)
    }
  )

  app.get(
    '/mobile/accounts-payable/day-fifteen',
    {
      schema: {
        response: {
          200: accountsToPaySchema,
        },
      },
    },
    async (_, reply) => {
      const data = await getContainer().accountsToPayByDayFifteen.execute()
      return reply.status(200).send(data)
    }
  )

  app.get(
    '/mobile/installments/remaining',
    {
      schema: {
        response: {
          200: remainingInstallmentsSchema,
        },
      },
    },
    async (_, reply) => {
      const data = await getContainer().getAllRemainingInstallments.execute()
      return reply.status(200).send(data)
    }
  )
}
