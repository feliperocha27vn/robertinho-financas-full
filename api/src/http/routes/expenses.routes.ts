import type { FastifyInstance } from 'fastify'
import { accountsPayableNextMonthController } from '../expenses/accounts-to-pay-by-day-fifteen-controller'

export function expensesRoutes(app: FastifyInstance) {
  app.register(accountsPayableNextMonthController)
}
