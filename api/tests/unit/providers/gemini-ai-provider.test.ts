import { describe, expect, it, vi } from 'vitest'
import { GeminiAiProvider } from '../../../src/providers/ai/gemini-ai-provider'

describe('GeminiAiProvider (Function Calling)', () => {
  it('sends tools and returns final text when there is no tool call', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: 'Resposta direta do modelo.',
      functionCalls: [],
    })

    const provider = new GeminiAiProvider({
      client: {
        models: { generateContent },
      } as any,
    })

    const result = await provider.generateReply('oi', {
      currentState: 'idle',
      pendingData: {},
      history: [],
      executeTool: vi.fn(),
    })

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-flash',
        config: expect.objectContaining({
          tools: expect.any(Array),
        }),
      })
    )

    expect(result.message).toBe('Resposta direta do modelo.')
    expect(result.history).toEqual([
      { role: 'user', content: 'oi' },
      { role: 'assistant', content: 'Resposta direta do modelo.' },
    ])
  })

  it('executes functionCall and sends functionResponse back to model', async () => {
    const generateContent = vi
      .fn()
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: 'create_expense',
            args: {
              description: 'ifood',
              amount: 50,
              category: 'OTHERS',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text: 'Pronto, despesa registrada.',
        functionCalls: [],
      })

    const executeTool = vi.fn().mockResolvedValue({ ok: true })

    const provider = new GeminiAiProvider({
      client: {
        models: { generateContent },
      } as any,
    })

    const result = await provider.generateReply('gastei 50 no ifood', {
      currentState: 'idle',
      pendingData: {},
      history: [],
      executeTool,
    })

    expect(executeTool).toHaveBeenCalledWith({
      name: 'create_expense',
      args: {
        description: 'ifood',
        amount: 50,
        category: 'OTHERS',
      },
    })

    expect(generateContent).toHaveBeenCalledTimes(2)
    expect(result.message).toBe('Pronto, despesa registrada.')
    expect(
      result.history.some(item => item.content.includes('[functionCall]'))
    ).toBe(true)
    expect(
      result.history.some(item => item.content.includes('[functionResponse]'))
    ).toBe(true)
  })

  it('injects current date and brazil timezone instruction in system context', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: 'ok',
      functionCalls: [],
    })

    const provider = new GeminiAiProvider({
      client: {
        models: { generateContent },
      } as any,
    })

    await provider.generateReply('quero registrar compra', {
      currentState: 'idle',
      pendingData: {},
      history: [],
      executeTool: vi.fn(),
    })

    const firstCallArgs = generateContent.mock.calls[0][0]
    const firstContentPart = firstCallArgs.contents[0].parts[0].text

    expect(firstContentPart).toContain('A data atual do sistema e')
    expect(firstContentPart).toContain('fuso horario do Brasil')
    expect(firstContentPart).toContain('get_all_remaining_installments')
    expect(firstContentPart).toContain('get_remaining_installments')
    expect(firstContentPart).toContain('get_sum_expenses')
    expect(firstContentPart).toContain('get_sum_expenses_fixed')
    expect(firstContentPart).toContain('get_unpaid_expenses_of_current_month')
    expect(firstContentPart).toContain('pay_installment')
    expect(firstContentPart).toContain('pay_all_unpaid_current_month')
    expect(firstContentPart).toContain('unpay_expense')
    expect(firstContentPart).toContain('accounts_to_pay_by_day_fifteen')
    expect(firstContentPart).toContain('create_recipe')
    expect(firstContentPart).toContain('get_home_data')
    expect(firstContentPart).toContain('create_calendar_event')
    expect(firstContentPart).toContain('list_calendar_events')
  })
})
