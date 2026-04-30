import { randomUUID } from 'node:crypto'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { ExpenseItem } from '../lib/types'
import type {
  CreateExpenseInput,
  CreateInstallmentExpenseInput,
  ExpenseSearchItem,
  ExpenseSearchManyItem,
  ExpensesRepository,
} from '../repositories/contracts/expenses-repository'
import type { InMemoryInstallmentsRepository } from './in-memory-installments-repository'

export class InMemoryExpensesRepository implements ExpensesRepository {
  public items: ExpenseItem[] = []

  constructor(
    private readonly installmentsRepository?: InMemoryInstallmentsRepository
  ) {}

  async create(input: CreateExpenseInput): Promise<ExpenseItem> {
    const expense: ExpenseItem = {
      id: randomUUID(),
      description: input.description,
      amount: input.amount,
      category: input.category,
      isFixed: input.isFixed ?? false,
      numberOfInstallments: input.numberOfInstallments ?? null,
      createdAt: new Date(),
    }

    this.items.push(expense)
    return expense
  }

  async findByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseSearchItem | null> {
    const found = this.items.find(item =>
      item.description.toLowerCase().includes(nameExpense.toLowerCase())
    )

    if (!found) {
      return null
    }

    return {
      id: found.id,
      description: found.description,
      amount: found.amount,
      isFixed: found.isFixed,
    }
  }

  async createInstallmentExpense(
    input: CreateInstallmentExpenseInput
  ): Promise<ExpenseItem> {
    const expense = await this.create({
      description: input.description,
      amount: input.amount,
      category: input.category,
      isFixed: false,
      numberOfInstallments: input.numberOfInstallments,
    })

    if (this.installmentsRepository) {
      this.installmentsRepository.setExpenseDescription(
        expense.id,
        expense.description
      )

      const value = input.amount / input.numberOfInstallments
      const installments = Array.from({
        length: input.numberOfInstallments,
      }).map((_, index) => {
        const dueDate = new Date(input.firstDueDate)
        dueDate.setMonth(dueDate.getMonth() + index)

        return {
          expensesId: expense.id,
          dueDate,
          isPaid: false,
          valueInstallmentOfExpense: value,
        }
      })

      await this.installmentsRepository.createMany(installments)
    }

    return expense
  }

  async findManyByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseSearchManyItem[]> {
    return this.items
      .filter(item =>
        item.description.toLowerCase().includes(nameExpense.toLowerCase())
      )
      .map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        isFixed: item.isFixed,
      }))
  }

  async updateAmountById(id: string, amount: number): Promise<void> {
    const item = this.items.find(expense => expense.id === id)
    if (item) {
      item.amount = amount
    }
  }

  async findAll(): Promise<ExpenseItem[]> {
    return [...this.items].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  async findFixed(): Promise<ExpenseItem[]> {
    return this.items.filter(item => item.isFixed)
  }

  async findVariableOneOffInRange(
    start: Date,
    end: Date
  ): Promise<ExpenseItem[]> {
    return this.items.filter(
      item =>
        !item.isFixed &&
        item.numberOfInstallments === null &&
        item.createdAt >= start &&
        item.createdAt <= end
    )
  }

  async findVariableOneOffCurrentMonth(): Promise<ExpenseItem[]> {
    return this.findVariableOneOffInRange(
      startOfMonth(new Date()),
      endOfMonth(new Date())
    )
  }

  async findVariableOneOffCurrentMonthByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseItem[]> {
    const items = await this.findVariableOneOffCurrentMonth()
    const normalized = nameExpense.toLowerCase()
    return items.filter(item =>
      item.description.toLowerCase().includes(normalized)
    )
  }

  async findAllFixedForStatus(): Promise<ExpenseSearchItem[]> {
    return this.items
      .filter(item => item.isFixed)
      .map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        isFixed: true,
      }))
  }

  async deleteById(id: string): Promise<void> {
    this.items = this.items.filter(item => item.id !== id)
  }

  async deleteManyByIds(ids: string[]): Promise<number> {
    const idsSet = new Set(ids)
    const before = this.items.length
    this.items = this.items.filter(item => !idsSet.has(item.id))
    return before - this.items.length
  }

  async sumAll(): Promise<number> {
    return this.items.reduce((total, item) => total + item.amount, 0)
  }

  async sumFixed(): Promise<number> {
    return this.items
      .filter(item => item.isFixed)
      .reduce((total, item) => total + item.amount, 0)
  }

  async sumVariableOneOffInRange(start: Date, end: Date): Promise<number> {
    const items = await this.findVariableOneOffInRange(start, end)
    return items.reduce((total, item) => total + item.amount, 0)
  }
}
