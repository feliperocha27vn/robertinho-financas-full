import type { ExpenseItem, TransactionType } from '../../lib/types'

export interface CreateExpenseInput {
  description: string
  amount: number
  category: TransactionType
  isFixed?: boolean
  numberOfInstallments?: number | null
}

export interface CreateInstallmentExpenseInput {
  description: string
  amount: number
  category: TransactionType
  numberOfInstallments: number
  firstDueDate: Date
}

export interface ExpenseSearchItem {
  id: string
  description: string
  amount: number
  isFixed: boolean
}

export interface ExpenseSearchManyItem {
  id: string
  description: string
  amount: number
  isFixed: boolean
}

export interface ExpensesRepository {
  create(input: CreateExpenseInput): Promise<ExpenseItem>
  createInstallmentExpense(
    input: CreateInstallmentExpenseInput
  ): Promise<ExpenseItem>
  findByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseSearchItem | null>
  findManyByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseSearchManyItem[]>
  updateAmountById(id: string, amount: number): Promise<void>
  findAll(): Promise<ExpenseItem[]>
  findFixed(): Promise<ExpenseItem[]>
  findVariableOneOffInRange(start: Date, end: Date): Promise<ExpenseItem[]>
  findVariableOneOffCurrentMonth(): Promise<ExpenseItem[]>
  findVariableOneOffCurrentMonthByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseItem[]>
  findAllFixedForStatus(): Promise<ExpenseSearchItem[]>
  deleteById(id: string): Promise<void>
  deleteManyByIds(ids: string[]): Promise<number>
  sumAll(): Promise<number>
  sumFixed(): Promise<number>
  sumVariableOneOffInRange(start: Date, end: Date): Promise<number>
}
