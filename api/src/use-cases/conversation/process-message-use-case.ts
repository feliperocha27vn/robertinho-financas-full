import { FiniteStateMachine } from '../../conversation/fsm'
import type { AiProvider } from '../../providers/ai/ai-provider'
import type { SessionRepository } from '../../repositories/contracts/session-repository'
import type { AccountsPayableNextMonthUseCase } from '../expenses/accounts-payable-next-month-use-case'
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
import type { PayInstallmentUseCase } from '../expenses/pay-installment-use-case'
import type { UnpayExpenseUseCase } from '../expenses/unpay-expense-use-case'
import type { CreateRecipeUseCase } from '../recipes/create-recipe-use-case'

interface Input {
  sessionId: string
  text: string
}

interface PendingInstallmentContext {
  description: string
  amount: number
  category: 'TRANSPORT' | 'OTHERS' | 'STUDIES' | 'RESIDENCE' | 'CREDIT'
  numberOfInstallments: number
}

export class ProcessMessageUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly aiProvider: AiProvider,
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly createExpenseInstallmentUseCase: CreateExpenseInstallmentUseCase,
    private readonly createRecipeUseCase: CreateRecipeUseCase,
    private readonly getSumExpensesUseCase: GetSumExpensesUseCase,
    private readonly getSumExpensesFixedUseCase: GetSumExpensesFixedUseCase,
    private readonly getSumExpensesOfMonthVariablesUseCase: GetSumExpensesOfMonthVariablesUseCase,
    private readonly getSumExpensesOfLastMonthVariablesUseCase: GetSumExpensesOfLastMonthVariablesUseCase,
    private readonly accountsPayableNextMonthUseCase: AccountsPayableNextMonthUseCase,
    private readonly getUnpaidExpensesOfCurrentMonthUseCase: GetUnpaidExpensesOfCurrentMonthUseCase,
    private readonly getRemainingInstallmentsUseCase: GetRemainingInstallmentsUseCase,
    private readonly getAllRemainingInstallmentsUseCase: GetAllRemainingInstallmentsUseCase,
    private readonly payInstallmentUseCase: PayInstallmentUseCase,
    private readonly payAllUnpaidCurrentMonthUseCase: PayAllUnpaidCurrentMonthUseCase,
    private readonly unpayExpenseUseCase: UnpayExpenseUseCase
  ) {}

  async execute(input: Input): Promise<{ message: string }> {
    const existing = await this.sessionRepository.findById(input.sessionId)
    const state = existing?.currentState ?? 'idle'
    const context = existing?.context ?? {}

    const fsm = new FiniteStateMachine(state, [
      {
        from: 'idle',
        to: 'collecting_installment_due_date',
        when: text =>
          text.toLowerCase().includes('parcelad') ||
          text.toLowerCase().includes('parcelado'),
      },
      {
        from: 'collecting_installment_due_date',
        to: 'idle',
        when: () => true,
      },
    ])

    const parsed = await this.aiProvider.parseMessage(input.text)
    const nextState = fsm.transition(input.text)

    if (
      nextState === 'collecting_installment_due_date' &&
      parsed.intent === 'create_expense_installment' &&
      !parsed.firstDueDate &&
      parsed.description &&
      parsed.amount !== undefined &&
      parsed.category &&
      parsed.numberOfInstallments
    ) {
      await this.sessionRepository.save({
        id: input.sessionId,
        currentState: nextState,
        context: {
          ...context,
          pendingInstallment: {
            description: parsed.description,
            amount: parsed.amount,
            category: parsed.category,
            numberOfInstallments: parsed.numberOfInstallments,
          } satisfies PendingInstallmentContext,
        },
        updatedAt: new Date(),
      })

      return {
        message:
          'Me fala a data da primeira parcela (dd/mm/aaaa) para eu registrar certinho.',
      }
    }

    if (state === 'collecting_installment_due_date') {
      const pending = context.pendingInstallment as
        | PendingInstallmentContext
        | undefined
      if (pending && parsed.firstDueDate) {
        await this.createExpenseInstallmentUseCase.execute({
          description: pending.description,
          amount: pending.amount,
          category: pending.category,
          numberOfInstallments: pending.numberOfInstallments,
          firstDueDate: parsed.firstDueDate,
        })

        await this.sessionRepository.save({
          id: input.sessionId,
          currentState: 'idle',
          context: {},
          updatedAt: new Date(),
        })

        return { message: 'Despesa parcelada registrada com sucesso.' }
      }
    }

    let responseMessage = 'Nao consegui entender. Pode reformular?'

    switch (parsed.intent) {
      case 'create_expense': {
        if (
          !parsed.description ||
          parsed.amount === undefined ||
          !parsed.category
        ) {
          responseMessage =
            'Preciso de descricao, valor e categoria para registrar a despesa.'
          break
        }
        await this.createExpenseUseCase.execute({
          description: parsed.description,
          amount: parsed.amount,
          category: parsed.category,
          isFixed: parsed.isFixed ?? false,
        })
        responseMessage = 'Despesa registrada com sucesso.'
        break
      }

      case 'create_expense_installment': {
        if (
          !parsed.description ||
          parsed.amount === undefined ||
          !parsed.category ||
          !parsed.numberOfInstallments ||
          !parsed.firstDueDate
        ) {
          responseMessage =
            'Preciso de descricao, valor, categoria, quantidade de parcelas e primeira data de vencimento.'
          break
        }

        await this.createExpenseInstallmentUseCase.execute({
          description: parsed.description,
          amount: parsed.amount,
          category: parsed.category,
          numberOfInstallments: parsed.numberOfInstallments,
          firstDueDate: parsed.firstDueDate,
        })

        responseMessage = 'Despesa parcelada registrada com sucesso.'
        break
      }

      case 'create_new_recipe': {
        if (!parsed.description || parsed.amount === undefined) {
          responseMessage =
            'Preciso da descricao e do valor para registrar a receita.'
          break
        }

        await this.createRecipeUseCase.execute({
          description: parsed.description,
          amount: parsed.amount,
        })

        responseMessage = 'Receita registrada com sucesso.'
        break
      }

      case 'get_sum_expenses': {
        const result = await this.getSumExpensesUseCase.execute()
        responseMessage = `Total de despesas: R$ ${Number(result.totalExpenses).toFixed(2)}`
        break
      }

      case 'get_sum_expenses_fixed': {
        const result = await this.getSumExpensesFixedUseCase.execute()
        responseMessage = `Total de despesas fixas: R$ ${Number(result.totalFixedExpenses).toFixed(2)}`
        break
      }

      case 'get_sum_expenses_of_month_variables': {
        const result =
          await this.getSumExpensesOfMonthVariablesUseCase.execute()
        responseMessage = `Total variavel do mes: R$ ${result.totalExpensesOfMonth.toFixed(2)}`
        break
      }

      case 'get_sum_expenses_of_last_month_variables': {
        const result =
          await this.getSumExpensesOfLastMonthVariablesUseCase.execute()
        responseMessage = `Total variavel do mes passado: R$ ${result.totalExpensesOfLastMonth.toFixed(2)}`
        break
      }

      case 'accounts_payable_next_month': {
        const result = await this.accountsPayableNextMonthUseCase.execute()
        responseMessage = `Total a pagar no proximo mes: R$ ${result.totalAmountForPayableNextMonth.toFixed(2)}`
        break
      }

      case 'get_unpaid_expenses_of_current_month': {
        const result =
          await this.getUnpaidExpensesOfCurrentMonthUseCase.execute()
        responseMessage = `Total pendente neste mes: R$ ${result.totalUnpaidAmount.toFixed(2)}`
        break
      }

      case 'get_remaining_installments': {
        if (!parsed.nameExpense) {
          responseMessage =
            'Me fala o nome da despesa para calcular parcelas restantes.'
          break
        }
        const result = await this.getRemainingInstallmentsUseCase.execute({
          nameExpense: parsed.nameExpense,
        })
        responseMessage = result.found
          ? `Restam ${result.remainingInstallments} parcelas.`
          : 'Nao encontrei essa despesa.'
        break
      }

      case 'get_all_remaining_installments': {
        const result = await this.getAllRemainingInstallmentsUseCase.execute()
        responseMessage = `Total restante em parcelados: R$ ${result.totalOverallRemaining.toFixed(2)}`
        break
      }

      case 'pay_installment': {
        if (!parsed.nameExpense) {
          responseMessage =
            'Me fala o nome da despesa para eu marcar a parcela como paga.'
          break
        }
        const result = await this.payInstallmentUseCase.execute({
          nameExpense: parsed.nameExpense,
        })
        responseMessage = result.found
          ? 'Parcela marcada como paga.'
          : 'Nao encontrei essa despesa.'
        break
      }

      case 'pay_all_unpaid_current_month': {
        const result = await this.payAllUnpaidCurrentMonthUseCase.execute()
        responseMessage = `Concluido. ${result.paidCount} item(ns) marcados como pagos.`
        break
      }

      case 'unpay_expense': {
        if (!parsed.nameExpense) {
          responseMessage = 'Me fala qual despesa deve voltar para pendente.'
          break
        }
        const result = await this.unpayExpenseUseCase.execute({
          nameExpense: parsed.nameExpense,
        })
        responseMessage = result.found
          ? 'Pagamento desmarcado com sucesso.'
          : 'Nao encontrei essa despesa.'
        break
      }

      default:
        responseMessage = 'Nao consegui entender. Pode reformular?'
    }

    await this.sessionRepository.save({
      id: input.sessionId,
      currentState: nextState,
      context,
      updatedAt: new Date(),
    })

    return { message: responseMessage }
  }
}
