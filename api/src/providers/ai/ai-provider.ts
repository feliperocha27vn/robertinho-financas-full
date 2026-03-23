import type { TransactionType } from '../../domain/finance'

export type AssistantIntent =
  | 'greeting'
  | 'pay_expenses'
  | 'update_expense'
  | 'update_expense_amount'
  | 'create_expense'
  | 'create_expense_installment'
  | 'create_new_recipe'
  | 'get_sum_expenses'
  | 'get_sum_expenses_fixed'
  | 'get_sum_expenses_of_month_variables'
  | 'get_sum_expenses_of_last_month_variables'
  | 'accounts_payable_next_month'
  | 'get_unpaid_expenses_of_current_month'
  | 'get_remaining_installments'
  | 'get_all_remaining_installments'
  | 'pay_installment'
  | 'pay_all_unpaid_current_month'
  | 'unpay_expense'
  | 'unknown'

export interface ParsedAssistantCommand {
  intent: AssistantIntent
  description?: string
  amount?: number
  category?: TransactionType
  isFixed?: boolean
  numberOfInstallments?: number
  nameExpense?: string
  expenseName?: string
  items?: string[]
  newValue?: number
  firstDueDate?: Date
}

export interface AiProvider {
  parseMessage(
    input: string,
    currentState?: string
  ): Promise<ParsedAssistantCommand>
}
