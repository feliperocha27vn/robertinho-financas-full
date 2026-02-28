import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { robertinhoDeFinancas } from '../../functions/gemini/chat'

// Schema para validar o payload do webhook da Evolution API de forma totalmente permissiva
const webhookPayloadSchema = z.object({
  event: z.string().optional(),
  instance: z.string().optional(),
  data: z.any().optional(), // Tornando opcional para não quebrar se vier sem 'data'
}).passthrough() // Permite qualquer outro campo não mapeado no objeto principal sem dar erro 400

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

      try {
        // Ignorar eventos que não sejam de mensagens para não causar erros (ex: atualização de contatos)
        if (event !== 'messages.upsert' && event !== 'messages.update') {
          return reply.status(200).send({
            success: true,
            message: `Evento ignorado: ${event}`,
          })
        }

        if (!data || !data.key) {
           return reply.status(200).send({
            success: true,
            message: 'Dados da mensagem ausentes. Ignorado.',
          })
        }

        // Só processar mensagens recebidas (não enviadas por nós)
        if (data.key.fromMe) {
          return reply.status(200).send({
            success: true,
            message: 'Mensagem ignorada (enviada por nós)',
          })
        }

        // Restrição de número permitido
        const allowedPhone = process.env.ALLOWED_PHONE_NUMBER
        // O remoteJid no baileys geralmente tem o formato "5511999999999@s.whatsapp.net"
        if (allowedPhone && !data.key.remoteJid.startsWith(allowedPhone)) {
          console.log(`🚫 Mensagem ignorada: número ${data.key.remoteJid} não tem permissão.`)
          return reply.status(200).send({
            success: true,
            message: 'Mensagem de número não autorizado ignorada',
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
        console.log('⏳ Enviando contexto para o Gemini...')

        // Processar com o Robertinho Finanças (passando o número para manter o contexto)
        const aiResponse = await robertinhoDeFinancas(messageText, data.key.remoteJid)

        console.log('🤖 Resposta do Gemini:', aiResponse.message)

        // Enviar a resposta via HTTP para a Evolution API
        const evoUrl = (process.env.EVOLUTION_API_URL || 'http://localhost:8080').replace(/\/$/, '')
        const evoApiKey = process.env.EVOLUTION_API_KEY || '429683C4C977415CAAFCCE10F7D57E11'

        console.log(`📤 Enviando resposta para Evolution API em: ${evoUrl}/message/sendText/${instance} para o número ${data.key.remoteJid}`)

        const evoResponse = await fetch(`${evoUrl}/message/sendText/${instance}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: evoApiKey,
          },
          body: JSON.stringify({
            number: data.key.remoteJid,
            text: aiResponse.message,
          }),
        })

        const evoResponseText = await evoResponse.text().catch(() => 'No text')
        console.log(`✅ Evolution API Status: ${evoResponse.status} | Body:`, evoResponseText)

        return reply.status(200).send({
          success: true,
          message: 'Mensagem processada e respondida com sucesso',
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
