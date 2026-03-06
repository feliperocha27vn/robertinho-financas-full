import type { FastifyInstance } from 'fastify'
import { getHomeDataController } from '../summary/get-home-data-controller'
import { expensesRoutes } from './expenses.routes'

export function indexRoutes(app: FastifyInstance) {
  app.register(expensesRoutes)
  app.register(getHomeDataController)
}
