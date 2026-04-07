import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getContainer } from '../../container'
import { env } from '../../env'
import { isTransientPrismaError } from '../../lib/prisma-retry'
import { telegramBot } from '../../lib/telegram'

// Schema simplificado para o App Mobile
const chatPayloadSchema = z.object({
  text: z.string(),
  phone: z.string().default('mobile-client'),
})

const telegramWebhookQuerySchema = z.object({
  secret: z.string().optional(),
})

const telegramUpdateSchema = z.object({
  message: z
    .object({
      text: z.string().optional(),
      chat: z.object({ id: z.union([z.string(), z.number()]) }),
      from: z.object({ id: z.union([z.string(), z.number()]) }).optional(),
    })
    .optional(),
})

export const webhookRoute: FastifyPluginAsyncZod = async app => {
  // Mantemos o endpoint /webhook mas agora ele ouve requisições diretas do App
  app.post(
    '/webhook',
    {
      schema: {
        body: chatPayloadSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { text, phone } = request.body

      try {
        if (!text) {
          return reply.status(400).send({
            error: 'Texto da mensagem nao pode ser vazio.',
          })
        }

        console.log(`💬 Processando mensagem do app [${phone}]:`, text)
        console.log('⏳ Enviando contexto para o Gemini...')

        // Chama a IA do Robertinho (o histórico é mantido pela chave "phone")
        const aiResponse = await getContainer().processMessage.execute({
          sessionId: phone,
          text,
        })

        console.log('🤖 Resposta do Gemini:', aiResponse.message)

        // Retorna a resposta HTTP diretamente para o App Mobile exibir na tela
        return reply.status(200).send({
          success: true,
          message: aiResponse.message,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)

        if (isTransientPrismaError(error)) {
          console.warn(
            `[webhook/chat] transient db error for session ${phone}: ${errorMessage}`
          )
        } else {
          console.error(
            `[webhook/chat] permanent error for session ${phone}: ${errorMessage}`
          )
        }

        return reply.status(400).send({
          error: 'Erro interno ao processar mensagem com a IA',
        })
      }
    }
  )

  app.post(
    '/webhook/telegram',
    {
      schema: {
        querystring: telegramWebhookQuerySchema,
        body: telegramUpdateSchema,
      },
    },
    async (request, reply) => {
      if (
        env.TELEGRAM_WEBHOOK_SECRET &&
        request.query.secret !== env.TELEGRAM_WEBHOOK_SECRET
      ) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const message = request.body.message
      if (!message?.text || message.text.startsWith('/')) {
        return reply.status(200).send({ ok: true })
      }

      const fromId = message.from?.id
      const chatId = message.chat.id
      const sessionId = fromId
        ? `telegram-${String(fromId)}`
        : `telegram-${String(chatId)}`

      try {
        const response = await getContainer().processMessage.execute({
          sessionId,
          text: message.text,
        })

        await telegramBot.sendMessage(Number(chatId), response.message, {
          parse_mode: 'HTML',
        })

        return reply.status(200).send({ ok: true })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)

        if (isTransientPrismaError(error)) {
          console.warn(
            `[webhook/telegram] transient db error for session ${sessionId}: ${errorMessage}`
          )
          await telegramBot
            .sendMessage(
              Number(chatId),
              'Tive uma indisponibilidade momentanea ao acessar seus dados. Tente novamente em alguns segundos.',
              {
                parse_mode: 'HTML',
              }
            )
            .catch(() => {})
        } else {
          console.error(
            `[webhook/telegram] permanent error for session ${sessionId}: ${errorMessage}`
          )
        }

        return reply.status(200).send({ ok: true })
      }
    }
  )
}
