import { describe, expect, it, vi } from 'vitest'
import { TelegramProvider } from '../../../src/providers/messaging/telegram-provider'

function makeBotMock() {
  const handlers = new Map<string, ((...args: any[]) => void)[]>()

  return {
    handlers,
    on: vi.fn((event: string, cb: (...args: any[]) => void) => {
      const list = handlers.get(event) ?? []
      list.push(cb)
      handlers.set(event, list)
    }),
    sendMessage: vi.fn().mockResolvedValue(undefined),
  }
}

describe('TelegramProvider', () => {
  it('forwards non-command messages to handler', async () => {
    const botMock = makeBotMock()
    const provider = new TelegramProvider(botMock as any)
    const handler = vi.fn().mockResolvedValue(undefined)

    provider.onMessage(handler)

    const messageHandler = botMock.handlers.get('message')?.[0]
    await messageHandler?.({
      text: 'oi',
      from: { id: 123 },
      chat: { id: 999 },
    })

    expect(handler).toHaveBeenCalledWith({
      sessionId: 'telegram-123',
      text: 'oi',
      rawChatId: '999',
    })
  })

  it('sends message to telegram chat id', async () => {
    const botMock = makeBotMock()
    const provider = new TelegramProvider(botMock as any)

    await provider.sendMessage('999', '<ul><li>teste</li></ul>')

    expect(botMock.sendMessage).toHaveBeenCalledWith(999, '• teste', {
      parse_mode: 'HTML',
    })
  })
})
