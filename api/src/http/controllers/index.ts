import type { FastifyInstance } from 'fastify'
import { healthController } from './health/health-controller'
import { getHomeDataController } from './summary/get-home-data-controller'
import { accountsPayableByDayFifteenController } from './expenses/accounts-payable-by-day-fifteen-controller'

export function registerControllers(app: FastifyInstance) {
  app.register(healthController)
  app.register(getHomeDataController)
  app.register(accountsPayableByDayFifteenController)
}
