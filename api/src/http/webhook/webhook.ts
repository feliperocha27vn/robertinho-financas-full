import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { robertinhoDeFinancas } from '../../functions/gemini/chat'

// Schema para validar o payload do webhook da Evolution API
const webhookPayloadSchema = z.object({
  event: z.string(),
  instance: z.string(),
  data: z.object({
    key: z.object({
      remoteJid: z.string(), // Número do remetente
      fromMe: z.boolean(), // Se a mensagem foi enviada por nós
      id: z.string(), // ID da mensagem
    }),
    message: z
      .object({
        conversation: z.string().optional(), // Texto da mensagem
        extendedTextMessage: z
          .object({
            text: z.string(),
          })
          .optional(),
      })
      .optional(),
    messageTimestamp: z.number(),
    pushName: z.string().optional(), // Nome do contato
  }),
})

export const webhookRoute: FastifyPluginAsyncZod = async app => {
  // Endpoint para receber webhooks da Evolution API
  app.post(
    '/webhook',
    {
      schema: {
        body: webhookPayloadSchema,
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          400: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { event, instance, data } = request.body

      console.log('🔗 Webhook recebido:', {
        event,
        instance,
        fromNumber: data.key.remoteJid,
        fromMe: data.key.fromMe,
        pushName: data.pushName,
      })

      try {
        // Só processar mensagens recebidas (não enviadas por nós)
        if (data.key.fromMe) {
          return reply.status(200).send({
            success: true,
            message: 'Mensagem ignorada (enviada por nós)',
          })
        }

        // Extrair o texto da mensagem
        let messageText = ''
        if (data.message?.conversation) {
          messageText = data.message.conversation
        } else if (data.message?.extendedTextMessage?.text) {
          messageText = data.message.extendedTextMessage.text
        }

        if (!messageText) {
          return reply.status(200).send({
            success: true,
            message: 'Mensagem sem texto ignorada',
          })
        }

        console.log('💬 Processando mensagem:', messageText)

        // Processar com o Robertinho Finanças
        const aiResponse = await robertinhoDeFinancas(messageText)

        // Em vez de enviar pela Evolution API, retornamos a resposta gerada
        // diretamente no corpo da resposta HTTP para facilitar integrações.
        return reply.status(200).send({
          success: true,
          message: aiResponse.message,
        })
      } catch (error) {
        console.error('❌ Erro ao processar webhook:', error)
        return reply.status(400).send({
          error: 'Erro interno ao processar mensagem',
        })
      }
    }
  )
}
// Nota: a lógica de envio por Evolution API foi removida —
// agora a rota retorna a mensagem gerada pelo Robertinho diretamente.
