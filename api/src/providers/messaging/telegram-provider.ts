import type TelegramBot from 'node-telegram-bot-api'
import type { MessagingProvider } from './messaging-provider'
import { sanitizeTelegramHtml, stripAllHtmlTags } from './telegram-html'

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

    this.bot.on('webhook_error', error => {
      console.error('Erro no webhook do Telegram:', error.message || error)
    })
  }

  async sendMessage(targetId: string, message: string): Promise<void> {
    const sanitized = sanitizeTelegramHtml(message)

    try {
      await this.bot.sendMessage(Number(targetId), sanitized, {
        parse_mode: 'HTML',
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("can't parse entities")
      ) {
        await this.bot.sendMessage(Number(targetId), stripAllHtmlTags(sanitized))
        return
      }

      throw error
    }
  }
}
