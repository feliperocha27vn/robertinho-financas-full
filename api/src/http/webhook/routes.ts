import type { FastifyInstance } from 'fastify'
import { webhookRoute } from './webhook'

export function webhookRoutes(app: FastifyInstance) {
  app.register(webhookRoute)
}