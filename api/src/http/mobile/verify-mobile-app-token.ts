import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../../env'

function extractBearerToken(request: FastifyRequest): string | null {
  const authorizationHeader = request.headers.authorization

  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(' ')

  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null
  }

  return token
}

export async function verifyMobileAppToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const configuredToken = process.env.MOBILE_APP_TOKEN ?? env.MOBILE_APP_TOKEN

  if (!configuredToken) {
    return reply.status(401).send({ message: 'Nao autorizado.' })
  }

  const providedToken = extractBearerToken(request)

  if (!providedToken || providedToken !== configuredToken) {
    return reply.status(401).send({ message: 'Nao autorizado.' })
  }
}
