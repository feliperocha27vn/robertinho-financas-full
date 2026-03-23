import { describe, expect, it, vi } from 'vitest'
import { InMemorySessionRepository } from '../../../src/repositories/in-memory/in-memory-session-repository'
import { ProcessMessageUseCase } from '../../../src/use-cases/conversation/process-message-use-case'

function makeSut(overrides?: {
  generateReply?: (input: string, context: any) => Promise<any>
}) {
  const sessions = new InMemorySessionRepository()
  const calendar = {
    createEvent: vi.fn(),
    listEvents: vi.fn(),
  }

  const useCases = {
    createExpense: { execute: vi.fn() },
    createExpenseInstallment: { execute: vi.fn() },
    createRecipe: { execute: vi.fn() },
    getSumExpenses: { execute: vi.fn() },
    getSumExpensesFixed: { execute: vi.fn() },
    getRemainingInstallments: { execute: vi.fn() },
    getAllRemainingInstallments: { execute: vi.fn() },
    getSumExpensesOfLastMonthVariables: { execute: vi.fn() },
    getUnpaidExpensesOfCurrentMonth: { execute: vi.fn() },
    payInstallment: { execute: vi.fn() },
    payAllUnpaidCurrentMonth: { execute: vi.fn() },
    unpayExpense: { execute: vi.fn() },
    accountsToPayByDayFifteen: { execute: vi.fn() },
    getHomeData: { execute: vi.fn() },
    getSumExpensesOfMonthVariables: { execute: vi.fn() },
    accountsPayableNextMonth: { execute: vi.fn() },
    payExpensesByNames: { execute: vi.fn() },
    updateExpenseAmount: { execute: vi.fn() },
  }

  const generateReply =
    overrides?.generateReply ??
    (async () => ({
      message: 'ok',
      history: [
        { role: 'user', content: 'oi' },
        { role: 'assistant', content: 'ok' },
      ],
    }))

  const sut = new ProcessMessageUseCase(
    sessions,
    { generateReply },
    calendar as any,
    useCases.createExpense as any,
    useCases.createExpenseInstallment as any,
    useCases.createRecipe as any,
    useCases.getSumExpenses as any,
    useCases.getSumExpensesFixed as any,
    useCases.getRemainingInstallments as any,
    useCases.getAllRemainingInstallments as any,
    useCases.getSumExpensesOfLastMonthVariables as any,
    useCases.getUnpaidExpensesOfCurrentMonth as any,
    useCases.payInstallment as any,
    useCases.payAllUnpaidCurrentMonth as any,
    useCases.unpayExpense as any,
    useCases.accountsToPayByDayFifteen as any,
    useCases.getHomeData as any,
    useCases.getSumExpensesOfMonthVariables as any,
    useCases.accountsPayableNextMonth as any,
    useCases.payExpensesByNames as any,
    useCases.updateExpenseAmount as any
  )

  return { sut, sessions, useCases, calendar }
}

describe('ProcessMessageUseCase (all tools wired)', () => {
  it('persists AI reply history', async () => {
    const { sut, sessions } = makeSut({
      generateReply: async () => ({
        message: 'Tudo certo, registrado.',
        history: [
          { role: 'user', content: 'gastei 50 no ifood' },
          { role: 'assistant', content: 'Tudo certo, registrado.' },
        ],
      }),
    })

    const result = await sut.execute({
      sessionId: 'telegram-basic',
      text: 'gastei 50 no ifood',
    })

    expect(result.message).toBe('Tudo certo, registrado.')
    const saved = await sessions.findById('telegram-basic')
    expect(saved?.history.length).toBe(2)
  })

  it('wires get_remaining_installments and get_all_remaining_installments tools', async () => {
    const { sut, useCases } = makeSut({
      generateReply: async (_input, context) => {
        await context.executeTool({
          name: 'get_remaining_installments',
          args: { nameExpense: 'moto' },
        })
        await context.executeTool({
          name: 'get_all_remaining_installments',
          args: {},
        })

        return {
          message: 'ok',
          history: [
            { role: 'user', content: 'parcelamentos' },
            { role: 'assistant', content: 'ok' },
          ],
        }
      },
    })

    await sut.execute({ sessionId: 't-parcelas', text: 'parcelamentos' })

    expect(useCases.getRemainingInstallments.execute).toHaveBeenCalledWith({
      nameExpense: 'moto',
    })
    expect(useCases.getAllRemainingInstallments.execute).toHaveBeenCalledTimes(
      1
    )
  })

  it('wires all remaining use-cases to tool callbacks', async () => {
    const { sut, useCases } = makeSut({
      generateReply: async (_input, context) => {
        await context.executeTool({
          name: 'create_expense',
          args: { description: 'ifood', amount: 50, category: 'OTHERS' },
        })
        await context.executeTool({
          name: 'create_expense_installment',
          args: {
            description: 'notebook',
            amount: 3000,
            category: 'CREDIT',
            numberOfInstallments: 10,
            firstDueDateIso: '2026-04-10T00:00:00.000Z',
          },
        })
        await context.executeTool({
          name: 'create_recipe',
          args: { description: 'salario', amount: 5000 },
        })
        await context.executeTool({ name: 'get_sum_expenses', args: {} })
        await context.executeTool({ name: 'get_sum_expenses_fixed', args: {} })
        await context.executeTool({
          name: 'get_sum_expenses_of_last_month_variables',
          args: {},
        })
        await context.executeTool({
          name: 'get_sum_expenses_of_month_variables',
          args: {},
        })
        await context.executeTool({
          name: 'get_unpaid_expenses_of_current_month',
          args: {},
        })
        await context.executeTool({
          name: 'pay_installment',
          args: { nameExpense: 'moto' },
        })
        await context.executeTool({
          name: 'pay_all_unpaid_current_month',
          args: {},
        })
        await context.executeTool({
          name: 'unpay_expense',
          args: { nameExpense: 'energia' },
        })
        await context.executeTool({
          name: 'accounts_to_pay_by_day_fifteen',
          args: {},
        })
        await context.executeTool({
          name: 'accounts_payable_next_month',
          args: {},
        })
        await context.executeTool({
          name: 'pay_expenses_by_names',
          args: { items: ['agua', 'luz'] },
        })
        await context.executeTool({
          name: 'update_expense_amount',
          args: { nameExpense: 'energia', amount: 120 },
        })
        await context.executeTool({ name: 'get_home_data', args: {} })

        return {
          message: 'ok',
          history: [
            { role: 'user', content: 'teste geral' },
            { role: 'assistant', content: 'ok' },
          ],
        }
      },
    })

    await sut.execute({ sessionId: 't-all-tools', text: 'teste geral' })

    expect(useCases.createExpense.execute).toHaveBeenCalled()
    expect(useCases.createExpenseInstallment.execute).toHaveBeenCalled()
    expect(useCases.createRecipe.execute).toHaveBeenCalledWith({
      description: 'salario',
      amount: 5000,
    })
    expect(useCases.getSumExpenses.execute).toHaveBeenCalled()
    expect(useCases.getSumExpensesFixed.execute).toHaveBeenCalled()
    expect(
      useCases.getSumExpensesOfLastMonthVariables.execute
    ).toHaveBeenCalled()
    expect(useCases.getSumExpensesOfMonthVariables.execute).toHaveBeenCalled()
    expect(useCases.getUnpaidExpensesOfCurrentMonth.execute).toHaveBeenCalled()
    expect(useCases.payInstallment.execute).toHaveBeenCalledWith({
      nameExpense: 'moto',
    })
    expect(useCases.payAllUnpaidCurrentMonth.execute).toHaveBeenCalled()
    expect(useCases.unpayExpense.execute).toHaveBeenCalledWith({
      nameExpense: 'energia',
    })
    expect(useCases.accountsToPayByDayFifteen.execute).toHaveBeenCalled()
    expect(useCases.accountsPayableNextMonth.execute).toHaveBeenCalled()
    expect(useCases.payExpensesByNames.execute).toHaveBeenCalledWith({
      items: ['agua', 'luz'],
    })
    expect(useCases.updateExpenseAmount.execute).toHaveBeenCalledWith({
      nameExpense: 'energia',
      amount: 120,
    })
    expect(useCases.getHomeData.execute).toHaveBeenCalled()
  })

  it('wires create_calendar_event and list_calendar_events tools', async () => {
    const { sut, calendar } = makeSut({
      generateReply: async (_input, context) => {
        await context.executeTool({
          name: 'create_calendar_event',
          args: {
            summary: 'Consulta medica',
            startTime: '2026-04-15T13:00:00.000Z',
            endTime: '2026-04-15T14:00:00.000Z',
          },
        })

        await context.executeTool({
          name: 'list_calendar_events',
          args: {
            timeMin: '2026-04-01T00:00:00.000Z',
            timeMax: '2026-04-30T23:59:59.999Z',
          },
        })

        return {
          message: 'ok',
          history: [
            { role: 'user', content: 'agenda' },
            { role: 'assistant', content: 'ok' },
          ],
        }
      },
    })

    await sut.execute({ sessionId: 't-calendar', text: 'agenda' })

    expect(calendar.createEvent).toHaveBeenCalledWith({
      summary: 'Consulta medica',
      startTime: '2026-04-15T13:00:00.000Z',
      endTime: '2026-04-15T14:00:00.000Z',
    })
    expect(calendar.listEvents).toHaveBeenCalledWith({
      timeMin: '2026-04-01T00:00:00.000Z',
      timeMax: '2026-04-30T23:59:59.999Z',
    })
  })
})
