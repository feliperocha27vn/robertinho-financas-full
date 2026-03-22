import { describe, expect, it } from 'vitest'
import { InMemorySessionRepository } from '../../../src/repositories/in-memory/in-memory-session-repository'
import { ProcessMessageUseCase } from '../../../src/use-cases/conversation/process-message-use-case'

const makeNoopUseCase = () => ({ execute: async () => ({}) })

describe('ProcessMessageUseCase', () => {
  it('returns prompt asking installment due date when intent is installment without date', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: async () => ({
          intent: 'create_expense_installment',
          description: 'celular',
          amount: 2400,
          category: 'CREDIT',
          numberOfInstallments: 12,
        }),
      },
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-1',
      text: 'quero cadastrar parcelado',
    })

    expect(result.message).toContain('data da primeira parcela')
    const session = await sessions.findById('telegram-1')
    expect(session?.currentState).toBe('collecting_installment_due_date')
  })

  it('completes installment creation when session awaits due date', async () => {
    const sessions = new InMemorySessionRepository()
    const createExpenseInstallmentSpy = { execute: async () => ({}) }

    await sessions.save({
      id: 'telegram-2',
      currentState: 'collecting_installment_due_date',
      context: {
        pendingInstallment: {
          description: 'notebook',
          amount: 4500,
          category: 'CREDIT',
          numberOfInstallments: 10,
        },
      },
      updatedAt: new Date(),
    })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: async () => ({
          intent: 'unknown',
          firstDueDate: new Date('2026-04-15T00:00:00.000Z'),
        }),
      },
      makeNoopUseCase() as any,
      createExpenseInstallmentSpy as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-2',
      text: '15/04/2026',
    })

    expect(result.message).toBe('Despesa parcelada registrada com sucesso.')
    const session = await sessions.findById('telegram-2')
    expect(session?.currentState).toBe('idle')
    expect(session?.context).toEqual({})
  })
})
