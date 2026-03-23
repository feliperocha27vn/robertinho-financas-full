import { describe, expect, it, vi } from 'vitest'
import { GeminiAiProvider } from '../../../src/providers/ai/gemini-ai-provider'

describe('GeminiAiProvider', () => {
  it('calls Gemini with structured output schema and maps JSON response', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        intent: 'create_expense',
        description: 'ifood',
        amount: 50,
        category: 'OTHERS',
        isFixed: false,
      }),
    })

    const provider = new GeminiAiProvider({
      client: {
        models: {
          generateContent,
        },
      } as any,
    })

    const result = await provider.parseMessage('Gastei 50 no ifood', 'idle')

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-flash',
        contents: expect.stringContaining(
          'NUNCA retorne pay_expenses com items vazio.'
        ),
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          responseJsonSchema: expect.any(Object),
        }),
      })
    )

    expect(result).toEqual(
      expect.objectContaining({
        intent: 'create_expense',
        description: 'ifood',
        amount: 50,
        category: 'OTHERS',
        isFixed: false,
      })
    )
  })

  it('returns unknown on invalid JSON', async () => {
    const provider = new GeminiAiProvider({
      client: {
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: 'not-json' }),
        },
      } as any,
    })

    await expect(provider.parseMessage('ola', 'idle')).resolves.toEqual(
      expect.objectContaining({ intent: 'unknown' })
    )
  })

  it('maps pay_expenses intent with multiple items', async () => {
    const provider = new GeminiAiProvider({
      client: {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              intent: 'pay_expenses',
              items: ['renegociacao', 'cartao'],
            }),
          }),
        },
      } as any,
    })

    await expect(
      provider.parseMessage('acabei de pagar a renegociacao e o cartao', 'idle')
    ).resolves.toEqual(
      expect.objectContaining({
        intent: 'pay_expenses',
        items: ['renegociacao', 'cartao'],
      })
    )
  })

  it('keeps Gemini output as single source of NLP truth', async () => {
    const provider = new GeminiAiProvider({
      client: {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              intent: 'pay_expenses',
              items: ['energia'],
            }),
          }),
        },
      } as any,
    })

    await expect(
      provider.parseMessage('eu paguei a energia', 'idle')
    ).resolves.toEqual(
      expect.objectContaining({
        intent: 'pay_expenses',
        items: ['energia'],
      })
    )
  })

  it('maps update_expense intent with expenseName and newValue', async () => {
    const provider = new GeminiAiProvider({
      client: {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              intent: 'update_expense',
              expenseName: 'energia',
              newValue: 110,
            }),
          }),
        },
      } as any,
    })

    await expect(
      provider.parseMessage('mude o valor da energia para 110', 'idle')
    ).resolves.toEqual(
      expect.objectContaining({
        intent: 'update_expense',
        expenseName: 'energia',
        nameExpense: 'energia',
        newValue: 110,
      })
    )
  })

  it('normalizes legacy update_expense_amount and maps fallback fields', async () => {
    const provider = new GeminiAiProvider({
      client: {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({
              intent: 'update_expense_amount',
              description: 'energia',
              amount: '110',
            }),
          }),
        },
      } as any,
    })

    await expect(
      provider.parseMessage(
        'mude o valor da despesa de energia para 110 reais',
        'idle'
      )
    ).resolves.toEqual(
      expect.objectContaining({
        intent: 'update_expense',
        nameExpense: 'energia',
        amount: 110,
      })
    )
  })
})
