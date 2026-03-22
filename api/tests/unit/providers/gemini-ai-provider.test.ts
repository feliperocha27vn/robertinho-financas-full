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
})
