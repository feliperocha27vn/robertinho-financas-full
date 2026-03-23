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

  it('returns formatted create-expense message from presenter', async () => {
    const sessions = new InMemorySessionRepository()
    const createExpenseExecute = vi.fn().mockResolvedValue({
      message:
        '✅ <b>Despesa Registrada com Sucesso!</b>\n💰 <b>Valor:</b> R$ 50,00',
    })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'create_expense',
          description: 'ifood',
          amount: 50,
          category: 'OTHERS',
          isFixed: false,
        }),
      },
      { execute: createExpenseExecute } as any,
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
      sessionId: 'telegram-expense',
      text: 'gastei 50 no ifood',
    })

    expect(createExpenseExecute).toHaveBeenCalledWith({
      description: 'ifood',
      amount: 50,
      category: 'OTHERS',
      isFixed: false,
    })
    expect(result.message).toContain(
      '✅ <b>Despesa Registrada com Sucesso!</b>'
    )
  })

  it('returns dashboard format for monthly summary intent', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'get_sum_expenses',
        }),
      },
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      {
        execute: vi.fn().mockResolvedValue({
          totalExpenses: '2050',
          items: [],
        }),
      } as any,
      {
        execute: vi.fn().mockResolvedValue({
          totalFixedExpenses: '1200',
          items: [],
        }),
      } as any,
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
      sessionId: 'telegram-summary',
      text: 'resumo',
    })

    expect(result.message).toContain('📊 <b>Resumo de')
    expect(result.message).toContain('🔴 <b>Despesas Fixas:</b>')
    expect(result.message).toContain('🟡 <b>Despesas Variaveis:</b>')
    expect(result.message).toContain('📉 <b>TOTAL GASTO:</b>')
  })

  it('returns formatted unpaid-current-month message with item list', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'get_unpaid_expenses_of_current_month',
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
      {
        execute: vi.fn().mockResolvedValue({
          unpaidExpenses: [
            { description: 'Internet', amount: 120 },
            { description: 'Aluguel', amount: 686 },
          ],
          totalUnpaidAmount: 806,
        }),
      } as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-unpaid',
      text: 'o que eu ainda tenho para pagar esse mes?',
    })

    expect(result.message).toContain('🧾 <b>Pendencias do Mes</b>')
    expect(result.message).toContain('💰 <b>Total pendente neste mes:</b> R$')
    expect(result.message).toContain('• Internet')
  })

  it('handles pay_expenses intent without fallback to unknown', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'pay_expenses',
          items: ['renegociacao', 'cartao'],
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
      {
        execute: vi.fn().mockResolvedValue({
          status: 'paid',
          paidDescriptions: ['Renegociacao', 'Cartao'],
          notFound: [],
        }),
      } as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-pay-expenses',
      text: 'acabei de pagar a renegociacao e o cartao',
    })

    expect(result.message).toContain('✅ <b>Contas marcadas como pagas:</b>')
    expect(result.message).not.toContain('Nao consegui entender')
  })

  it('asks disambiguation question when pay_expenses is ambiguous', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'pay_expenses',
          items: ['cartao'],
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
      {
        execute: vi.fn().mockResolvedValue({
          status: 'ambiguous',
          term: 'cartao',
          options: ['Cartao Nubank', 'Cartao Inter'],
        }),
      } as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-pay-expenses-ambiguous',
      text: 'paguei cartao',
    })

    expect(result.message).toContain(
      '🤔 <b>Encontrei mais de uma opcao para:</b>'
    )
    expect(result.message).toContain('Cartao Nubank')
    expect(result.message).toContain('Cartao Inter')
  })

  it('returns detailed dashboard for accounts payable next month', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'accounts_payable_next_month',
        }),
      },
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      {
        execute: vi.fn().mockResolvedValue({
          accountsPayableNextMonth: [
            { description: 'Energia', amount: 130 },
            { description: 'Internet', amount: 99.9 },
          ],
          totalAmountForPayableNextMonth: 229.9,
        }),
      } as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-next-month',
      text: 'que tenho para pagar mes que vem?',
    })

    expect(result.message).toContain('📅 <b>Contas para')
    expect(result.message).toContain('🧾 <b>Quantidade de contas:</b> 2')
    expect(result.message).toContain('• Energia')
    expect(result.message).toContain('• Internet')
  })

  it('updates expense amount via update_expense_amount intent', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'update_expense',
          expenseName: 'energia',
          newValue: 110,
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
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      {
        execute: vi.fn().mockResolvedValue({
          status: 'updated',
          description: 'Energia',
          oldAmount: 130,
          newAmount: 110,
        }),
      } as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-update-expense',
      text: 'mude o valor da despesa energia para 110',
    })

    expect(result.message).toContain('✏️ <b>Despesa atualizada com sucesso!</b>')
    expect(result.message).toContain('🧾 <b>Despesa:</b> Energia')
  })

  it('enters awaiting_expense_value when update_expense comes without value', async () => {
    const sessions = new InMemorySessionRepository()

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'update_expense',
          expenseName: 'energia',
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
      makeNoopUseCase() as any,
      makeNoopUseCase() as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-awaiting-update',
      text: 'mude a energia',
    })

    expect(result.message).toContain('Me fala o novo valor para a despesa')
    const session = await sessions.findById('telegram-awaiting-update')
    expect(session?.currentState).toBe('awaiting_expense_value')
  })

  it('updates expense when awaiting_expense_value receives only numeric value', async () => {
    const sessions = new InMemorySessionRepository()

    await sessions.save({
      id: 'telegram-awaiting-update-2',
      currentState: 'awaiting_expense_value',
      context: {
        pendingUpdateExpense: {
          expenseName: 'energia',
        },
      },
      updatedAt: new Date(),
    })

    const updateExecute = vi.fn().mockResolvedValue({
      status: 'updated',
      description: 'Energia',
      oldAmount: 130,
      newAmount: 110,
    })

    const sut = new ProcessMessageUseCase(
      sessions,
      {
        parseMessage: vi.fn().mockResolvedValue({
          intent: 'update_expense',
          newValue: 110,
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
      makeNoopUseCase() as any,
      makeNoopUseCase() as any,
      { execute: updateExecute } as any
    )

    const result = await sut.execute({
      sessionId: 'telegram-awaiting-update-2',
      text: '110',
    })

    expect(updateExecute).toHaveBeenCalledWith({
      nameExpense: 'energia',
      amount: 110,
    })
    expect(result.message).toContain('✏️ <b>Despesa atualizada com sucesso!</b>')

    const session = await sessions.findById('telegram-awaiting-update-2')
    expect(session?.currentState).toBe('idle')
  })
})
