import { describe, expect, it, vi } from 'vitest'
import { InMemorySessionRepository } from '../../../src/repositories/in-memory/in-memory-session-repository'
import { ProcessMessageUseCase } from '../../../src/use-cases/conversation/process-message-use-case'

const makeNoopUseCase = () => ({ execute: async () => ({}) })

describe('ProcessMessageUseCase', () => {
  it('returns friendly guidance when user sends greeting', async () => {
    const sessions = new InMemorySessionRepository()
    const parseMessage = vi.fn().mockResolvedValue({ intent: 'greeting' })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage,
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
      sessionId: 'telegram-hello',
      text: 'ola',
    })

    expect(parseMessage).toHaveBeenCalledWith('ola', 'idle')
    expect(result.message).toContain('Fala! Eu sou o Robertinho')
  })

  it('moves FSM to collecting_installment_due_date when Gemini returns installment without due date', async () => {
    const sessions = new InMemorySessionRepository()
    const parseMessage = vi.fn().mockResolvedValue({
      intent: 'create_expense_installment',
      description: 'celular',
      amount: 2400,
      category: 'CREDIT',
      numberOfInstallments: 12,
    })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage,
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
      text: 'comprei um celular em 12x',
    })

    expect(parseMessage).toHaveBeenCalledWith(
      'comprei um celular em 12x',
      'idle'
    )
    expect(result.message).toContain('data da primeira parcela')
    const session = await sessions.findById('telegram-1')
    expect(session?.currentState).toBe('collecting_installment_due_date')
  })

  it('completes installment flow when Gemini returns due date JSON', async () => {
    const sessions = new InMemorySessionRepository()
    const createExpenseInstallmentExecute = vi.fn().mockResolvedValue({})
    const createExpenseInstallmentSpy = {
      execute: createExpenseInstallmentExecute,
    }

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

    const parseMessage = vi.fn().mockResolvedValue({
      intent: 'unknown',
      firstDueDate: new Date('2026-04-15T00:00:00.000Z'),
    })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage,
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

    expect(parseMessage).toHaveBeenCalledWith(
      '15/04/2026',
      'collecting_installment_due_date'
    )
    expect(createExpenseInstallmentExecute).toHaveBeenCalledWith({
      description: 'notebook',
      amount: 4500,
      category: 'CREDIT',
      numberOfInstallments: 10,
      firstDueDate: new Date('2026-04-15T00:00:00.000Z'),
    })
    expect(result.message).toBe('Despesa parcelada registrada com sucesso.')
    const session = await sessions.findById('telegram-2')
    expect(session?.currentState).toBe('idle')
    expect(session?.context).toEqual({})
  })

  it('keeps collecting state when due date JSON is not returned yet', async () => {
    const sessions = new InMemorySessionRepository()

    await sessions.save({
      id: 'telegram-3',
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

    const parseMessage = vi.fn().mockResolvedValue({
      intent: 'unknown',
    })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage,
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
      sessionId: 'telegram-3',
      text: 'ainda estou pensando',
    })

    expect(parseMessage).toHaveBeenCalledWith(
      'ainda estou pensando',
      'collecting_installment_due_date'
    )
    expect(result.message).toBe('Nao consegui entender. Pode reformular?')

    const session = await sessions.findById('telegram-3')
    expect(session?.currentState).toBe('collecting_installment_due_date')
  })
})
