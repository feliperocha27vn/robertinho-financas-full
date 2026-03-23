import type TelegramBot from 'node-telegram-bot-api'
import type { MessagingProvider } from './messaging-provider'

export class TelegramProvider implements MessagingProvider {
  constructor(private readonly bot: TelegramBot) {}

  onMessage(
    handler: (message: {
      sessionId: string
      text: string
      rawChatId?: string
    }) => Promise<void>
  ): void {
    this.bot.on('message', async msg => {
      if (!msg.text || msg.text.startsWith('/')) {
        return
      }

      const sessionId = msg.from?.id
        ? `telegram-${msg.from.id}`
        : `telegram-${msg.chat.id}`
      await handler({
        sessionId,
        text: msg.text,
        rawChatId: String(msg.chat.id),
      })
    })

    this.bot.on('polling_error', error => {
      console.error('Erro no polling do Telegram:', error.message || error)
    })
  }

  async sendMessage(targetId: string, message: string): Promise<void> {
    await this.bot.sendMessage(Number(targetId), message, {
      parse_mode: 'HTML',
    })
  }
}
