import { Prisma } from '@prisma/client'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { ExpenseItem } from '../../../lib/types'
import { prisma } from '../../../lib/prisma'
import { withPrismaRetry } from '../../../utils/prisma-retry'
import type {
  CreateExpenseInput,
  CreateInstallmentExpenseInput,
  ExpenseSearchItem,
  ExpenseSearchManyItem,
  ExpensesRepository,
} from '../../contracts/expenses-repository'

export class PrismaExpensesRepository implements ExpensesRepository {
  async create(input: CreateExpenseInput): Promise<ExpenseItem> {
    const created = await withPrismaRetry(
      () =>
        prisma.expenses.create({
          data: {
            description: input.description,
            amount: new Prisma.Decimal(input.amount),
            category: input.category,
            isFixed: input.isFixed ?? false,
            numberOfInstallments: input.numberOfInstallments ?? null,
          },
        }),
      'expensesRepository.create'
    )

    return {
      id: created.id,
      description: created.description,
      amount: Number(created.amount),
      category: created.category,
      isFixed: created.isFixed,
      numberOfInstallments: created.numberOfInstallments,
      createdAt: created.createdAt,
    }
  }

  async createInstallmentExpense(
    input: CreateInstallmentExpenseInput
  ): Promise<ExpenseItem> {
    const expense = await withPrismaRetry(
      () =>
        prisma.$transaction(async tx => {
          const created = await tx.expenses.create({
            data: {
              description: input.description,
              amount: new Prisma.Decimal(input.amount),
              category: input.category,
              numberOfInstallments: input.numberOfInstallments,
              isFixed: false,
            },
          })

          const value = input.amount / input.numberOfInstallments
          const installments = Array.from({
            length: input.numberOfInstallments,
          }).map((_, index) => {
            const dueDate = new Date(input.firstDueDate)
            dueDate.setMonth(dueDate.getMonth() + index)

            return {
              expensesId: created.id,
              dueDate,
              isPaid: false,
              valueInstallmentOfExpense: new Prisma.Decimal(value),
            }
          })

          await tx.installments.createMany({ data: installments })

          return created
        }),
      'expensesRepository.createInstallmentExpense'
    )

    return {
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      isFixed: expense.isFixed,
      numberOfInstallments: expense.numberOfInstallments,
      createdAt: expense.createdAt,
    }
  }

  async findByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseSearchItem | null> {
    const found = await withPrismaRetry(
      () =>
        prisma.expenses.findFirst({
          where: {
            description: {
              contains: nameExpense,
              mode: 'insensitive',
            },
          },
        }),
      'expensesRepository.findByDescriptionContains'
    )

    if (!found) {
      return null
    }

    return {
      id: found.id,
      description: found.description,
      amount: Number(found.amount),
      isFixed: found.isFixed,
    }
  }

  async findManyByDescriptionContains(
    nameExpense: string
  ): Promise<ExpenseSearchManyItem[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.expenses.findMany({
          where: {
            description: {
              contains: nameExpense,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            description: true,
            amount: true,
            isFixed: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      'expensesRepository.findManyByDescriptionContains'
    )

    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      isFixed: item.isFixed,
    }))
  }

  async updateAmountById(id: string, amount: number): Promise<void> {
    await withPrismaRetry(
      () =>
        prisma.expenses.update({
          where: { id },
          data: { amount: new Prisma.Decimal(amount) },
        }),
      'expensesRepository.updateAmountById'
    )
  }

  async findAll(): Promise<ExpenseItem[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.expenses.findMany({
          orderBy: { createdAt: 'desc' },
        }),
      'expensesRepository.findAll'
    )
    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      category: item.category,
      isFixed: item.isFixed,
      numberOfInstallments: item.numberOfInstallments,
      createdAt: item.createdAt,
    }))
  }

  async findFixed(): Promise<ExpenseItem[]> {
    const items = await withPrismaRetry(
      () => prisma.expenses.findMany({ where: { isFixed: true } }),
      'expensesRepository.findFixed'
    )
    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      category: item.category,
      isFixed: item.isFixed,
      numberOfInstallments: item.numberOfInstallments,
      createdAt: item.createdAt,
    }))
  }

  async findVariableOneOffInRange(
    start: Date,
    end: Date
  ): Promise<ExpenseItem[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.expenses.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            isFixed: false,
            numberOfInstallments: null,
          },
          orderBy: { createdAt: 'desc' },
        }),
      'expensesRepository.findVariableOneOffInRange'
    )

    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      category: item.category,
      isFixed: item.isFixed,
      numberOfInstallments: item.numberOfInstallments,
      createdAt: item.createdAt,
    }))
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
    const items = await withPrismaRetry(
      () =>
        prisma.expenses.findMany({
          where: {
            createdAt: {
              gte: startOfMonth(new Date()),
              lte: endOfMonth(new Date()),
            },
            isFixed: false,
            numberOfInstallments: null,
            description: {
              contains: nameExpense,
              mode: 'insensitive',
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      'expensesRepository.findVariableOneOffCurrentMonthByDescriptionContains'
    )

    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      category: item.category,
      isFixed: item.isFixed,
      numberOfInstallments: item.numberOfInstallments,
      createdAt: item.createdAt,
    }))
  }

  async findAllFixedForStatus(): Promise<ExpenseSearchItem[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.expenses.findMany({
          where: { isFixed: true },
          select: { id: true, description: true, amount: true, isFixed: true },
        }),
      'expensesRepository.findAllFixedForStatus'
    )

    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      isFixed: item.isFixed,
    }))
  }

  async deleteById(id: string): Promise<void> {
    await withPrismaRetry(
      () => prisma.expenses.delete({ where: { id } }),
      'expensesRepository.deleteById'
    )
  }

  async deleteManyByIds(ids: string[]): Promise<number> {
    if (ids.length === 0) {
      return 0
    }

    const result = await withPrismaRetry(
      () =>
        prisma.expenses.deleteMany({
          where: { id: { in: ids } },
        }),
      'expensesRepository.deleteManyByIds'
    )

    return result.count
  }

  async sumAll(): Promise<number> {
    const { _sum } = await withPrismaRetry(
      () => prisma.expenses.aggregate({ _sum: { amount: true } }),
      'expensesRepository.sumAll'
    )
    return Number(_sum.amount ?? 0)
  }

  async sumFixed(): Promise<number> {
    const { _sum } = await withPrismaRetry(
      () =>
        prisma.expenses.aggregate({
          _sum: { amount: true },
          where: { isFixed: true },
        }),
      'expensesRepository.sumFixed'
    )
    return Number(_sum.amount ?? 0)
  }

  async sumVariableOneOffInRange(start: Date, end: Date): Promise<number> {
    const { _sum } = await withPrismaRetry(
      () =>
        prisma.expenses.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: start, lte: end },
            isFixed: false,
            numberOfInstallments: null,
          },
        }),
      'expensesRepository.sumVariableOneOffInRange'
    )

    return Number(_sum.amount ?? 0)
  }
}
