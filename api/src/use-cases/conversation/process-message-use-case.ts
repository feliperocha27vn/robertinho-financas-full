import type { TransactionType } from '../../domain/finance'
import { handleCreateCalendarEvent } from '../../functions/calendar/handlers/handle-create-calendar-event'
import { handleListCalendarEvents } from '../../functions/calendar/handlers/handle-list-calendar-events'
import type { AiProvider, ToolCall } from '../../providers/ai/ai-provider'
import type { CalendarProvider } from '../../providers/calendar/calendar-provider'
import type { SessionRepository } from '../../repositories/contracts/session-repository'
import type { AccountsPayableNextMonthUseCase } from '../expenses/accounts-payable-next-month-use-case'
import type { AccountsToPayByDayFifteenUseCase } from '../expenses/accounts-to-pay-by-day-fifteen-use-case'
import type { CreateExpenseInstallmentUseCase } from '../expenses/create-expense-installment-use-case'
import type { CreateExpenseUseCase } from '../expenses/create-expense-use-case'
import type { GetAllRemainingInstallmentsUseCase } from '../expenses/get-all-remaining-installments-use-case'
import type { GetRemainingInstallmentsUseCase } from '../expenses/get-remaining-installments-use-case'
import type { GetSumExpensesFixedUseCase } from '../expenses/get-sum-expenses-fixed-use-case'
import type { GetSumExpensesOfLastMonthVariablesUseCase } from '../expenses/get-sum-expenses-of-last-month-variables-use-case'
import type { GetSumExpensesOfMonthVariablesUseCase } from '../expenses/get-sum-expenses-of-month-variables-use-case'
import type { GetSumExpensesUseCase } from '../expenses/get-sum-expenses-use-case'
import type { GetUnpaidExpensesOfCurrentMonthUseCase } from '../expenses/get-unpaid-expenses-of-current-month-use-case'
import type { PayAllUnpaidCurrentMonthUseCase } from '../expenses/pay-all-unpaid-current-month-use-case'
import type { PayExpensesByNamesUseCase } from '../expenses/pay-expenses-by-names-use-case'
import type { PayInstallmentUseCase } from '../expenses/pay-installment-use-case'
import type { UnpayExpenseUseCase } from '../expenses/unpay-expense-use-case'
import type { UpdateExpenseAmountUseCase } from '../expenses/update-expense-amount-use-case'
import type { CreateRecipeUseCase } from '../recipes/create-recipe-use-case'
import type { GetHomeDataUseCase } from '../summary/get-home-data-use-case'

interface Input {
  sessionId: string
  text: string
}

export class ProcessMessageUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly aiProvider: AiProvider,
    private readonly calendarProvider: CalendarProvider,
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly createExpenseInstallmentUseCase: CreateExpenseInstallmentUseCase,
    private readonly createRecipeUseCase: CreateRecipeUseCase,
    private readonly getSumExpensesUseCase: GetSumExpensesUseCase,
    private readonly getSumExpensesFixedUseCase: GetSumExpensesFixedUseCase,
    private readonly getRemainingInstallmentsUseCase: GetRemainingInstallmentsUseCase,
    private readonly getAllRemainingInstallmentsUseCase: GetAllRemainingInstallmentsUseCase,
    private readonly getSumExpensesOfLastMonthVariablesUseCase: GetSumExpensesOfLastMonthVariablesUseCase,
    private readonly getUnpaidExpensesOfCurrentMonthUseCase: GetUnpaidExpensesOfCurrentMonthUseCase,
    private readonly payInstallmentUseCase: PayInstallmentUseCase,
    private readonly payAllUnpaidCurrentMonthUseCase: PayAllUnpaidCurrentMonthUseCase,
    private readonly unpayExpenseUseCase: UnpayExpenseUseCase,
    private readonly accountsToPayByDayFifteenUseCase: AccountsToPayByDayFifteenUseCase,
    private readonly getHomeDataUseCase: GetHomeDataUseCase,
    private readonly getSumExpensesOfMonthVariablesUseCase: GetSumExpensesOfMonthVariablesUseCase,
    private readonly accountsPayableNextMonthUseCase: AccountsPayableNextMonthUseCase,
    private readonly payExpensesByNamesUseCase: PayExpensesByNamesUseCase,
    private readonly updateExpenseAmountUseCase: UpdateExpenseAmountUseCase
  ) {}

  async execute(input: Input): Promise<{ message: string }> {
    const existing = await this.sessionRepository.findById(input.sessionId)
    const history = existing?.history ?? []

    const result = await this.aiProvider.generateReply(input.text, {
      currentState: existing?.currentState ?? 'idle',
      pendingData: existing?.context ?? {},
      history,
      executeTool: call => this.executeToolCall(call),
    })

    await this.sessionRepository.save({
      id: input.sessionId,
      currentState: 'idle',
      context: {},
      history: result.history,
      updatedAt: new Date(),
    })

    return { message: result.message }
  }

  private async executeToolCall(call: ToolCall): Promise<unknown> {
    switch (call.name) {
      case 'create_expense': {
        const result = await this.createExpenseUseCase.execute({
          description: String(call.args.description ?? ''),
          amount: Number(call.args.amount ?? 0),
          category: String(call.args.category ?? 'OTHERS') as TransactionType,
          isFixed: Boolean(call.args.isFixed ?? false),
        })

        return { ok: true, result }
      }

      case 'create_expense_installment': {
        await this.createExpenseInstallmentUseCase.execute({
          description: String(call.args.description ?? ''),
          amount: Number(call.args.amount ?? 0),
          category: String(call.args.category ?? 'OTHERS') as TransactionType,
          numberOfInstallments: Number(call.args.numberOfInstallments ?? 1),
          firstDueDate: new Date(String(call.args.firstDueDateIso ?? '')),
        })

        return {
          ok: true,
          result: { message: 'Despesa parcelada registrada com sucesso.' },
        }
      }

      case 'update_expense_amount': {
        const result = await this.updateExpenseAmountUseCase.execute({
          nameExpense: String(call.args.nameExpense ?? ''),
          amount: Number(call.args.amount ?? 0),
        })
        return { ok: true, result }
      }

      case 'pay_expenses_by_names': {
        const rawItems = Array.isArray(call.args.items) ? call.args.items : []
        const items = rawItems
          .map(item => String(item))
          .filter(item => item.length > 0)

        const result = await this.payExpensesByNamesUseCase.execute({ items })
        return { ok: true, result }
      }

      case 'accounts_payable_next_month': {
        const result = await this.accountsPayableNextMonthUseCase.execute()
        return { ok: true, result }
      }

      case 'get_sum_expenses_of_month_variables': {
        const result =
          await this.getSumExpensesOfMonthVariablesUseCase.execute()
        return { ok: true, result }
      }

      case 'get_sum_expenses': {
        const result = await this.getSumExpensesUseCase.execute()
        return { ok: true, result }
      }

      case 'get_sum_expenses_fixed': {
        const result = await this.getSumExpensesFixedUseCase.execute()
        return { ok: true, result }
      }

      case 'get_sum_expenses_of_last_month_variables': {
        const result =
          await this.getSumExpensesOfLastMonthVariablesUseCase.execute()
        return { ok: true, result }
      }

      case 'get_unpaid_expenses_of_current_month': {
        const result =
          await this.getUnpaidExpensesOfCurrentMonthUseCase.execute()
        return { ok: true, result }
      }

      case 'get_remaining_installments': {
        const result = await this.getRemainingInstallmentsUseCase.execute({
          nameExpense: String(call.args.nameExpense ?? ''),
        })
        return { ok: true, result }
      }

      case 'get_all_remaining_installments': {
        const result = await this.getAllRemainingInstallmentsUseCase.execute()
        return { ok: true, result }
      }

      case 'pay_installment': {
        const result = await this.payInstallmentUseCase.execute({
          nameExpense: String(call.args.nameExpense ?? ''),
        })
        return { ok: true, result }
      }

      case 'pay_all_unpaid_current_month': {
        const result = await this.payAllUnpaidCurrentMonthUseCase.execute()
        return { ok: true, result }
      }

      case 'unpay_expense': {
        const result = await this.unpayExpenseUseCase.execute({
          nameExpense: String(call.args.nameExpense ?? ''),
        })
        return { ok: true, result }
      }

      case 'accounts_to_pay_by_day_fifteen': {
        const result = await this.accountsToPayByDayFifteenUseCase.execute()
        return { ok: true, result }
      }

      case 'create_recipe': {
        await this.createRecipeUseCase.execute({
          description: String(call.args.description ?? ''),
          amount: Number(call.args.amount ?? 0),
        })

        return {
          ok: true,
          result: { message: 'Receita registrada com sucesso.' },
        }
      }

      case 'get_home_data': {
        const result = await this.getHomeDataUseCase.execute()
        return { ok: true, result }
      }

      case 'create_calendar_event': {
        return handleCreateCalendarEvent(this.calendarProvider, call.args)
      }

      case 'list_calendar_events': {
        return handleListCalendarEvents(this.calendarProvider, call.args)
      }

      default:
        return { ok: false, error: `Tool ${call.name} nao implementada.` }
    }
  }
}
