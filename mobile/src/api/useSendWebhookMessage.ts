import { useState } from 'react'
import api from '../lib/axios'

type WebhookResponse = {
  success: boolean
  message: string
}

export function useSendWebhookMessage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(messageText: string): Promise<WebhookResponse> {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        event: 'message',
        instance: 'mobile',
        data: {
          key: {
            remoteJid: 'mobile-client',
            fromMe: false,
            id: Date.now().toString(),
          },
          message: { extendedTextMessage: { text: messageText } },
          messageTimestamp: Math.floor(Date.now() / 1000),
          pushName: 'Mobile User',
        },
      }

      const res = await api.post('/webhook', payload)
      setLoading(false)
      return res.data as WebhookResponse
    } catch (err: unknown) {
      setLoading(false)
      let message = 'Erro ao enviar'
      if (err && typeof err === 'object' && 'message' in err) {
        message = (err as Error).message
      } else {
        message = String(err)
      }
      setError(message)
      throw err
    }
  }

  return { send, loading, error }
}
