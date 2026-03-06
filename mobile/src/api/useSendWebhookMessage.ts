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
        text: messageText,
        phone: 'mobile-client' // Valor default para a sessão do app
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
