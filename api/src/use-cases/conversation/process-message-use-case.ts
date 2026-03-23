import { addMonths } from 'date-fns'
import { FiniteStateMachine } from '../../conversation/fsm'
import { MessageFormatter } from '../../presenters/message-formatter'
import type {
  AiProvider,
  ParsedAssistantCommand,
} from '../../providers/ai/ai-provider'
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
import type { PayExpensesByNamesUseCase } from '../expenses/pay-expenses-by-names-use-case'
import type { PayInstallmentUseCase } from '../expenses/pay-installment-use-case'
import type { UnpayExpenseUseCase } from '../expenses/unpay-expense-use-case'
import type { UpdateExpenseAmountUseCase } from '../expenses/update-expense-amount-use-case'
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

interface PendingUpdateExpenseContext {
  expenseName: string
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
    private readonly payExpensesByNamesUseCase: PayExpensesByNamesUseCase,
    private readonly payAllUnpaidCurrentMonthUseCase: PayAllUnpaidCurrentMonthUseCase,
    private readonly unpayExpenseUseCase: UnpayExpenseUseCase,
    private readonly updateExpenseAmountUseCase: UpdateExpenseAmountUseCase
  ) {}

  async execute(input: Input): Promise<{ message: string }> {
    const existing = await this.sessionRepository.findById(input.sessionId)
    const state = existing?.currentState ?? 'idle'
    const context = existing?.context ?? {}

    const fsm = new FiniteStateMachine(state, [
      {
        from: 'idle',
        to: 'collecting_installment_due_date',
        when: parsed => {
          const command = parsed as ParsedAssistantCommand
          return (
            command.intent === 'create_expense_installment' &&
            !command.firstDueDate &&
            !!command.description &&
            command.amount !== undefined &&
            !!command.category &&
            !!command.numberOfInstallments
          )
        },
      },
      {
        from: 'collecting_installment_due_date',
        to: 'idle',
        when: parsed => {
          const command = parsed as ParsedAssistantCommand
          return !!command.firstDueDate
        },
      },
      {
        from: 'idle',
        to: 'awaiting_expense_value',
        when: parsed => {
          const command = parsed as ParsedAssistantCommand
          const intent =
            command.intent === 'update_expense_amount'
              ? 'update_expense'
              : command.intent

          return (
            intent === 'update_expense' &&
            !!(command.expenseName ?? command.nameExpense) &&
            command.newValue === undefined &&
            command.amount === undefined
          )
        },
      },
      {
        from: 'awaiting_expense_value',
        to: 'idle',
        when: parsed => {
          const command = parsed as ParsedAssistantCommand
          return command.newValue !== undefined || command.amount !== undefined
        },
      },
    ])

    const parsed = await this.aiProvider.parseMessage(input.text, state)
    const nextState = fsm.transition(parsed)

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

    if (state === 'awaiting_expense_value') {
      const pending = context.pendingUpdateExpense as
        | PendingUpdateExpenseContext
        | undefined
      const parsedValue = parsed.newValue ?? parsed.amount

      if (pending && parsedValue !== undefined) {
        const result = await this.updateExpenseAmountUseCase.execute({
          nameExpense: pending.expenseName,
          amount: parsedValue,
        })

        await this.sessionRepository.save({
          id: input.sessionId,
          currentState: 'idle',
          context: {},
          updatedAt: new Date(),
        })

        if (result.status === 'not_found') {
          return {
            message:
              'Nao encontrei essa despesa para atualizar. Me fala um nome mais especifico.',
          }
        }

        if (result.status === 'ambiguous') {
          return {
            message: MessageFormatter.updateExpenseAmountAmbiguity({
              options: result.options,
            }),
          }
        }

        return {
          message: MessageFormatter.updateExpenseAmountSuccess({
            description: result.description,
            oldAmount: result.oldAmount,
            newAmount: result.newAmount,
          }),
        }
      }
    }

    if (nextState === 'awaiting_expense_value') {
      const expenseName = parsed.expenseName ?? parsed.nameExpense

      await this.sessionRepository.save({
        id: input.sessionId,
        currentState: 'awaiting_expense_value',
        context: {
          ...context,
          pendingUpdateExpense: {
            expenseName,
          } satisfies PendingUpdateExpenseContext,
        },
        updatedAt: new Date(),
      })

      return {
        message: `Me fala o novo valor para a despesa <b>${expenseName}</b>.`,
      }
    }

    let responseMessage = 'Nao consegui entender. Pode reformular?'

    switch (parsed.intent) {
      case 'greeting': {
        responseMessage =
          'Fala! Eu sou o Robertinho. Posso registrar despesa/receita, marcar pagamento e te mostrar resumos. Exemplo: "gastei R$ 45 com uber".'
        break
      }

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
        const result = await this.createExpenseUseCase.execute({
          description: parsed.description,
          amount: parsed.amount,
          category: parsed.category,
          isFixed: parsed.isFixed ?? false,
        })
        responseMessage = result.message
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
        const totalAll = Number(result.totalExpenses)
        const fixedResult = await this.getSumExpensesFixedUseCase.execute()
        const fixedTotal = Number(fixedResult.totalFixedExpenses)
        const variableTotal = Math.max(0, totalAll - fixedTotal)

        responseMessage = MessageFormatter.monthlySummary({
          referenceDate: new Date(),
          fixedExpenses: fixedTotal,
          variableExpenses: variableTotal,
          overallTotal: totalAll,
        })
        break
      }

      case 'get_sum_expenses_fixed': {
        const result = await this.getSumExpensesFixedUseCase.execute()
        responseMessage = MessageFormatter.totalWithItems({
          title: 'Despesas Fixas',
          emoji: '🔴',
          totalLabel: 'Total de despesas fixas',
          totalAmount: Number(result.totalFixedExpenses),
          items: result.items.map(item => ({
            description: item.description,
            amount: item.amount,
          })),
        })
        break
      }

      case 'get_sum_expenses_of_month_variables': {
        const result =
          await this.getSumExpensesOfMonthVariablesUseCase.execute()

        const variableItems = result.items.map(item => ({
          description: item.description,
          amount: item.amount,
        }))

        responseMessage = MessageFormatter.totalWithItems({
          title: 'Despesas Variaveis do Mes',
          emoji: '🟡',
          totalLabel: 'Total variavel do mes',
          totalAmount: result.totalExpensesOfMonth,
          items: variableItems,
        })
        break
      }

      case 'get_sum_expenses_of_last_month_variables': {
        const result =
          await this.getSumExpensesOfLastMonthVariablesUseCase.execute()
        responseMessage = MessageFormatter.totalWithItems({
          title: 'Despesas Variaveis do Mes Passado',
          emoji: '📆',
          totalLabel: 'Total variavel do mes passado',
          totalAmount: result.totalExpensesOfLastMonth,
          items: result.items.map(item => ({
            description: item.description,
            amount: item.amount,
          })),
        })
        break
      }

      case 'accounts_payable_next_month': {
        const result = await this.accountsPayableNextMonthUseCase.execute()
        responseMessage = MessageFormatter.accountsPayableNextMonth({
          referenceDate: addMonths(new Date(), 1),
          items: result.accountsPayableNextMonth,
          totalAmount: result.totalAmountForPayableNextMonth,
        })
        break
      }

      case 'get_unpaid_expenses_of_current_month': {
        const result =
          await this.getUnpaidExpensesOfCurrentMonthUseCase.execute()
        responseMessage = MessageFormatter.totalWithItems({
          title: 'Pendencias do Mes',
          emoji: '🧾',
          totalLabel: 'Total pendente neste mes',
          totalAmount: result.totalUnpaidAmount,
          items: result.unpaidExpenses.map(item => ({
            description: item.description,
            amount: item.amount,
          })),
        })
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

      case 'pay_expenses': {
        if (!parsed.items || parsed.items.length === 0) {
          responseMessage =
            'Me fala quais contas voce pagou. Exemplo: "paguei luz e agua".'
          break
        }

        const result = await this.payExpensesByNamesUseCase.execute({
          items: parsed.items,
        })

        if (result.status === 'ambiguous') {
          responseMessage = MessageFormatter.payExpensesAmbiguity({
            term: result.term,
            options: result.options,
          })
          break
        }

        responseMessage = MessageFormatter.payExpensesSuccess({
          paidDescriptions: result.paidDescriptions,
          notFound: result.notFound,
        })
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

      case 'update_expense':
      case 'update_expense_amount': {
        const expenseName = parsed.expenseName ?? parsed.nameExpense
        const newValue = parsed.newValue ?? parsed.amount

        if (!expenseName || newValue === undefined) {
          responseMessage =
            'Me diga a despesa e o novo valor. Exemplo: "mude energia para 110".'
          break
        }

        const result = await this.updateExpenseAmountUseCase.execute({
          nameExpense: expenseName,
          amount: newValue,
        })

        if (result.status === 'not_found') {
          responseMessage =
            'Nao encontrei essa despesa para atualizar. Me fala um nome mais especifico.'
          break
        }

        if (result.status === 'ambiguous') {
          responseMessage = MessageFormatter.updateExpenseAmountAmbiguity({
            options: result.options,
          })
          break
        }

        responseMessage = MessageFormatter.updateExpenseAmountSuccess({
          description: result.description,
          oldAmount: result.oldAmount,
          newAmount: result.newAmount,
        })

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
