import { describe, expect, it } from 'vitest'
import { GeminiAiProvider } from '../../../src/providers/ai/gemini-ai-provider'

describe('GeminiAiProvider', () => {
  it('maps basic intents from text', async () => {
    const provider = new GeminiAiProvider()

    await expect(provider.parseMessage('registrar receita')).resolves.toEqual(
      expect.objectContaining({ intent: 'create_new_recipe' })
    )
    await expect(provider.parseMessage('compra parcelada')).resolves.toEqual(
      expect.objectContaining({ intent: 'create_expense_installment' })
    )
    await expect(provider.parseMessage('registrar despesa')).resolves.toEqual(
      expect.objectContaining({ intent: 'create_expense' })
    )
  })

  it('extracts amount, installments and first due date', async () => {
    const provider = new GeminiAiProvider()

    const result = await provider.parseMessage(
      'comprei notebook parcelado em 10x de R$ 4.500,50 primeira parcela 15/04/2026'
    )

    expect(result.intent).toBe('create_expense_installment')
    expect(result.amount).toBe(4500.5)
    expect(result.numberOfInstallments).toBe(10)
    expect(result.firstDueDate).toBeInstanceOf(Date)
    expect(result.firstDueDate?.toISOString()).toContain('2026-04-15')
  })

  it('detects expense status change intents', async () => {
    const provider = new GeminiAiProvider()

    await expect(provider.parseMessage('quitei internet')).resolves.toEqual(
      expect.objectContaining({
        intent: 'pay_installment',
        nameExpense: 'internet',
      })
    )

    await expect(
      provider.parseMessage('ainda nao paguei internet')
    ).resolves.toEqual(
      expect.objectContaining({
        intent: 'unpay_expense',
        nameExpense: 'internet',
      })
    )
  })
})
