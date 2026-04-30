import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'

export const healthController: FastifyPluginAsyncZod = async app => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
    async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    }
  )
}
