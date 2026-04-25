import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env'
import { mobileRoutes } from './http/mobile/routes'
import { indexRoutes } from './http/routes/index.routes'
import { webhookRoutes } from './http/webhook/routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/health', async (_, reply) => {
  return reply.status(200).send({ status: 'ok' })
})

app.register(webhookRoutes)
app.register(indexRoutes)
app.register(mobileRoutes)
