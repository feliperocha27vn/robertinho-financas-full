import { makeProcessMessageUseCase } from '../factories/make-process-message-use-case'
import { telegramBot } from '../lib/telegram'
import { TelegramProvider } from '../providers/messaging/telegram-provider'

export function startTelegramBot() {
  const provider = new TelegramProvider(telegramBot)
  const processMessageUseCase = makeProcessMessageUseCase()

  provider.onMessage(async message => {
    if (!message.rawChatId) {
      return
    }

    try {
      const response = await processMessageUseCase.execute({
        sessionId: message.sessionId,
        text: message.text,
      })

      await provider.sendMessage(message.rawChatId, response.message)
    } catch (error) {
      console.error('Erro ao processar mensagem do Telegram:', error)
      await provider.sendMessage(
        message.rawChatId,
        'Puxa, deu um errinho aqui ao falar com o Robertinho. Tenta de novo em instantes!'
      )
    }
  })

  console.log('🤖 Telegram Bot iniciado')
}
