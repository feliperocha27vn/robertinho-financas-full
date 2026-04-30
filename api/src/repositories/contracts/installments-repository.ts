import type { InstallmentItem } from '../../lib/types'

export interface CreateInstallmentInput {
  expensesId: string
  dueDate: Date
  isPaid: boolean
  valueInstallmentOfExpense: number
}

export interface InstallmentWithExpenseDescription {
  id: string
  expensesId: string
  dueDate: Date
  isPaid: boolean
  valueInstallmentOfExpense: number
  expenseDescription: string
}

export interface InstallmentsRepository {
  create(input: CreateInstallmentInput): Promise<InstallmentItem>
  createMany(inputs: CreateInstallmentInput[]): Promise<void>
  findFirstPaidOfMonthByExpense(
    expensesId: string,
    monthDate: Date
  ): Promise<InstallmentItem | null>
  findNextUnpaidByExpense(expensesId: string): Promise<InstallmentItem | null>
  findLatestPaidByExpense(expensesId: string): Promise<InstallmentItem | null>
  findFirstUnpaidByExpense(expensesId: string): Promise<InstallmentItem | null>
  countUnpaidByExpense(expensesId: string): Promise<number>
  updatePaidStatusById(id: string, isPaid: boolean): Promise<void>
  deleteById(id: string): Promise<void>
  findPaidFixedExpenseIdsInMonth(
    expenseIds: string[],
    monthDate: Date
  ): Promise<string[]>
  findUnpaidDueUntil(endDate: Date): Promise<InstallmentItem[]>
  markManyPaid(ids: string[]): Promise<void>
  sumUnpaidInRange(startDate: Date, endDate: Date): Promise<number>
  findUnpaidInRangeWithDescription(
    startDate: Date,
    endDate: Date
  ): Promise<InstallmentWithExpenseDescription[]>
  findAllUnpaidWithDescription(): Promise<InstallmentWithExpenseDescription[]>
  updateUnpaidInstallmentAmountsByExpenseId(
    expensesId: string,
    installmentValue: number
  ): Promise<number>
}
