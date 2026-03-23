import { randomUUID } from 'node:crypto'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { InstallmentItem } from '../../domain/finance'
import type {
  CreateInstallmentInput,
  InstallmentsRepository,
  InstallmentWithExpenseDescription,
} from '../contracts/installments-repository'

export class InMemoryInstallmentsRepository implements InstallmentsRepository {
  public items: InstallmentItem[] = []
  private expenseDescriptionById = new Map<string, string>()

  setExpenseDescription(expenseId: string, description: string) {
    this.expenseDescriptionById.set(expenseId, description)
  }

  async create(input: CreateInstallmentInput): Promise<InstallmentItem> {
    const installment: InstallmentItem = {
      id: randomUUID(),
      expensesId: input.expensesId,
      dueDate: input.dueDate,
      isPaid: input.isPaid,
      valueInstallmentOfExpense: input.valueInstallmentOfExpense,
    }

    this.items.push(installment)
    return installment
  }

  async createMany(inputs: CreateInstallmentInput[]): Promise<void> {
    for (const input of inputs) {
      await this.create(input)
    }
  }

  async findFirstPaidOfMonthByExpense(
    expensesId: string,
    monthDate: Date
  ): Promise<InstallmentItem | null> {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)

    return (
      this.items.find(
        item =>
          item.expensesId === expensesId &&
          item.isPaid &&
          item.dueDate >= start &&
          item.dueDate <= end
      ) ?? null
    )
  }

  async findNextUnpaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const unpaid = this.items
      .filter(item => item.expensesId === expensesId && !item.isPaid)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    return unpaid[0] ?? null
  }

  async findLatestPaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const paid = this.items
      .filter(item => item.expensesId === expensesId && item.isPaid)
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())

    return paid[0] ?? null
  }

  async findFirstUnpaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const unpaid = this.items
      .filter(item => item.expensesId === expensesId && !item.isPaid)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    return unpaid[0] ?? null
  }

  async countUnpaidByExpense(expensesId: string): Promise<number> {
    return this.items.filter(
      item => item.expensesId === expensesId && !item.isPaid
    ).length
  }

  async updatePaidStatusById(id: string, isPaid: boolean): Promise<void> {
    const item = this.items.find(it => it.id === id)
    if (item) {
      item.isPaid = isPaid
    }
  }

  async deleteById(id: string): Promise<void> {
    this.items = this.items.filter(it => it.id !== id)
  }

  async findPaidFixedExpenseIdsInMonth(
    expenseIds: string[],
    monthDate: Date
  ): Promise<string[]> {
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const paidIds = new Set<string>()

    for (const item of this.items) {
      if (
        expenseIds.includes(item.expensesId) &&
        item.isPaid &&
        item.dueDate >= start &&
        item.dueDate <= end
      ) {
        paidIds.add(item.expensesId)
      }
    }

    return Array.from(paidIds)
  }

  async findUnpaidDueUntil(endDate: Date): Promise<InstallmentItem[]> {
    return this.items.filter(item => !item.isPaid && item.dueDate <= endDate)
  }

  async markManyPaid(ids: string[]): Promise<void> {
    const idSet = new Set(ids)
    for (const item of this.items) {
      if (idSet.has(item.id)) {
        item.isPaid = true
      }
    }
  }

  async sumUnpaidInRange(startDate: Date, endDate: Date): Promise<number> {
    return this.items
      .filter(
        item =>
          !item.isPaid && item.dueDate >= startDate && item.dueDate <= endDate
      )
      .reduce((total, item) => total + item.valueInstallmentOfExpense, 0)
  }

  async findUnpaidInRangeWithDescription(
    startDate: Date,
    endDate: Date
  ): Promise<InstallmentWithExpenseDescription[]> {
    return this.items
      .filter(
        item =>
          !item.isPaid && item.dueDate >= startDate && item.dueDate <= endDate
      )
      .map(item => ({
        ...item,
        expenseDescription:
          this.expenseDescriptionById.get(item.expensesId) ?? 'Sem descricao',
      }))
  }

  async findAllUnpaidWithDescription(): Promise<
    InstallmentWithExpenseDescription[]
  > {
    return this.items
      .filter(item => !item.isPaid)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .map(item => ({
        ...item,
        expenseDescription:
          this.expenseDescriptionById.get(item.expensesId) ?? 'Sem descricao',
      }))
  }

  async updateUnpaidInstallmentAmountsByExpenseId(
    expensesId: string,
    installmentValue: number
  ): Promise<number> {
    let updated = 0
    for (const item of this.items) {
      if (item.expensesId === expensesId && !item.isPaid) {
        item.valueInstallmentOfExpense = installmentValue
        updated += 1
      }
    }

    return updated
  }
}
