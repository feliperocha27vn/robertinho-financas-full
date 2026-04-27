import { env } from '../env'
import { makeProcessMessageUseCase } from '../factories/make-process-message-use-case'
import { telegramBot } from '../lib/telegram'
import { TelegramProvider } from '../providers/messaging/telegram-provider'

function getWebhookUrl() {
  const appName = process.env.FLY_APP_NAME
  if (!appName) {
    return null
  }

  const secret = env.TELEGRAM_WEBHOOK_SECRET
  const suffix = secret ? `?secret=${encodeURIComponent(secret)}` : ''
  return `https://${appName}.fly.dev/webhook/telegram${suffix}`
}

export async function startTelegramBot() {
  const provider = new TelegramProvider(telegramBot)
  const processMessageUseCase = makeProcessMessageUseCase()

  const webhookUrl = getWebhookUrl()

  if (webhookUrl) {
    await telegramBot.deleteWebHook()
    await telegramBot.setWebHook(webhookUrl)
    console.log(`🤖 Telegram webhook configurado em ${webhookUrl}`)
  } else {
    console.log('🤖 Telegram Bot iniciando em modo polling (sem FLY_APP_NAME)')
  }

  provider.onMessage(async message => {
    if (!message.rawChatId) {
      return
    }

    try {
      const response = await processMessageUseCase.execute({
        sessionId: message.sessionId,
        text: message.text,
      })

      const formattedMessage = response.message
      console.log('📤 Telegram formatted message:', formattedMessage)

      await provider.sendMessage(message.rawChatId, formattedMessage)
    } catch (error) {
      console.error('Erro ao processar mensagem do Telegram:', error)
      await provider.sendMessage(
        message.rawChatId,
        'Puxa, deu um errinho aqui ao falar com o Robertinho. Tenta de novo em instantes!'
      )
    }
  })

  console.log(
    `🤖 Telegram Bot iniciado (${webhookUrl ? 'webhook' : 'polling'} mode)`
  )
}
