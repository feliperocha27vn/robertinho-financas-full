import { Prisma } from '@prisma/client'
import type { ExpenseItem } from '../../domain/finance'
import { prisma } from '../../lib/prisma'
import type {
  CreateExpenseInput,
  CreateInstallmentExpenseInput,
  ExpenseSearchItem,
  ExpensesRepository,
} from '../contracts/expenses-repository'

export class PrismaExpensesRepository implements ExpensesRepository {
  async create(input: CreateExpenseInput): Promise<ExpenseItem> {
    const created = await prisma.expenses.create({
      data: {
        description: input.description,
        amount: new Prisma.Decimal(input.amount),
        category: input.category,
        isFixed: input.isFixed ?? false,
        numberOfInstallments: input.numberOfInstallments ?? null,
      },
    })

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
    const expense = await prisma.$transaction(async tx => {
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
    })

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
    const found = await prisma.expenses.findFirst({
      where: {
        description: {
          contains: nameExpense,
          mode: 'insensitive',
        },
      },
    })

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

  async findAll(): Promise<ExpenseItem[]> {
    const items = await prisma.expenses.findMany({
      orderBy: { createdAt: 'desc' },
    })
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
    const items = await prisma.expenses.findMany({ where: { isFixed: true } })
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
    const items = await prisma.expenses.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        isFixed: false,
        numberOfInstallments: null,
      },
      orderBy: { createdAt: 'desc' },
    })

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
    const items = await prisma.expenses.findMany({
      where: { isFixed: true },
      select: { id: true, description: true, amount: true, isFixed: true },
    })

    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: Number(item.amount),
      isFixed: item.isFixed,
    }))
  }

  async sumAll(): Promise<number> {
    const { _sum } = await prisma.expenses.aggregate({ _sum: { amount: true } })
    return Number(_sum.amount ?? 0)
  }

  async sumFixed(): Promise<number> {
    const { _sum } = await prisma.expenses.aggregate({
      _sum: { amount: true },
      where: { isFixed: true },
    })
    return Number(_sum.amount ?? 0)
  }

  async sumVariableOneOffInRange(start: Date, end: Date): Promise<number> {
    const { _sum } = await prisma.expenses.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: start, lte: end },
        isFixed: false,
        numberOfInstallments: null,
      },
    })

    return Number(_sum.amount ?? 0)
  }
}
