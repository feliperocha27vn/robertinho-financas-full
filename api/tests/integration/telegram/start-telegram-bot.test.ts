import { describe, expect, it, vi } from 'vitest'

const { botMock, handlers, processMessageUseCaseMock } = vi.hoisted(() => {
  const map = new Map<string, ((payload: any) => Promise<void> | void)[]>()
  const on = vi.fn(
    (event: string, cb: (payload: any) => Promise<void> | void) => {
      const list = map.get(event) ?? []
      list.push(cb)
      map.set(event, list)
    }
  )

  const sendMessage = vi.fn().mockResolvedValue(undefined)
  const deleteWebHook = vi.fn().mockResolvedValue(true)
  const setWebHook = vi.fn().mockResolvedValue(true)
  const execute = vi.fn().mockResolvedValue({ message: 'resposta telegram' })

  return {
    handlers: map,
    botMock: { on, sendMessage, deleteWebHook, setWebHook },
    processMessageUseCaseMock: { execute },
  }
})

vi.mock('../../../src/lib/telegram', () => ({
  telegramBot: botMock,
}))

vi.mock('../../../src/factories/make-process-message-use-case', () => ({
  makeProcessMessageUseCase: () => processMessageUseCaseMock,
}))

import { startTelegramBot } from '../../../src/telegram'

describe('startTelegramBot', () => {
  it('processes incoming telegram message and sends response', async () => {
    process.env.FLY_APP_NAME = 'test-app'
    await startTelegramBot()

    const messageHandler = handlers.get('message')?.[0]
    await messageHandler?.({
      text: 'oi',
      from: { id: 123 },
      chat: { id: 999 },
    })

    expect(processMessageUseCaseMock.execute).toHaveBeenCalledWith({
      sessionId: 'telegram-123',
      text: 'oi',
    })
    expect(botMock.sendMessage).toHaveBeenCalledWith(999, 'resposta telegram', {
      parse_mode: 'HTML',
    })
  })
})
