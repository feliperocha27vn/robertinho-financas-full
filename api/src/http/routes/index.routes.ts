import type { FastifyInstance } from 'fastify'
import { expensesRoutes } from './expenses.routes'

export function indexRoutes(app: FastifyInstance) {
  app.register(expensesRoutes)
}
