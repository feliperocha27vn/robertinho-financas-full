import { Prisma } from '@prisma/client'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { InstallmentItem } from '../../domain/finance'
import { prisma } from '../../lib/prisma'
import type {
  CreateInstallmentInput,
  InstallmentsRepository,
  InstallmentWithExpenseDescription,
} from '../contracts/installments-repository'

function toInstallmentItem(item: {
  id: string
  expensesId: string
  dueDate: Date
  isPaid: boolean
  valueInstallmentOfExpense: Prisma.Decimal
}): InstallmentItem {
  return {
    id: item.id,
    expensesId: item.expensesId,
    dueDate: item.dueDate,
    isPaid: item.isPaid,
    valueInstallmentOfExpense: Number(item.valueInstallmentOfExpense),
  }
}

export class PrismaInstallmentsRepository implements InstallmentsRepository {
  async create(input: CreateInstallmentInput): Promise<InstallmentItem> {
    const created = await prisma.installments.create({
      data: {
        expensesId: input.expensesId,
        dueDate: input.dueDate,
        isPaid: input.isPaid,
        valueInstallmentOfExpense: new Prisma.Decimal(
          input.valueInstallmentOfExpense
        ),
      },
    })

    return toInstallmentItem(created)
  }

  async createMany(inputs: CreateInstallmentInput[]): Promise<void> {
    await prisma.installments.createMany({
      data: inputs.map(input => ({
        expensesId: input.expensesId,
        dueDate: input.dueDate,
        isPaid: input.isPaid,
        valueInstallmentOfExpense: new Prisma.Decimal(
          input.valueInstallmentOfExpense
        ),
      })),
    })
  }

  async findFirstPaidOfMonthByExpense(
    expensesId: string,
    monthDate: Date
  ): Promise<InstallmentItem | null> {
    const item = await prisma.installments.findFirst({
      where: {
        expensesId,
        isPaid: true,
        dueDate: {
          gte: startOfMonth(monthDate),
          lte: endOfMonth(monthDate),
        },
      },
    })

    return item ? toInstallmentItem(item) : null
  }

  async findNextUnpaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const item = await prisma.installments.findFirst({
      where: { expensesId, isPaid: false },
      orderBy: { dueDate: 'asc' },
    })

    return item ? toInstallmentItem(item) : null
  }

  async findLatestPaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const item = await prisma.installments.findFirst({
      where: { expensesId, isPaid: true },
      orderBy: { dueDate: 'desc' },
    })

    return item ? toInstallmentItem(item) : null
  }

  async findFirstUnpaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const item = await prisma.installments.findFirst({
      where: { expensesId, isPaid: false },
      orderBy: { dueDate: 'asc' },
    })

    return item ? toInstallmentItem(item) : null
  }

  async countUnpaidByExpense(expensesId: string): Promise<number> {
    return prisma.installments.count({ where: { expensesId, isPaid: false } })
  }

  async updatePaidStatusById(id: string, isPaid: boolean): Promise<void> {
    await prisma.installments.update({ where: { id }, data: { isPaid } })
  }

  async deleteById(id: string): Promise<void> {
    await prisma.installments.delete({ where: { id } })
  }

  async findPaidFixedExpenseIdsInMonth(
    expenseIds: string[],
    monthDate: Date
  ): Promise<string[]> {
    if (expenseIds.length === 0) {
      return []
    }

    const items = await prisma.installments.findMany({
      where: {
        isPaid: true,
        dueDate: { gte: startOfMonth(monthDate), lte: endOfMonth(monthDate) },
        expensesId: { in: expenseIds },
      },
      select: { expensesId: true },
    })

    return Array.from(new Set(items.map(item => item.expensesId)))
  }

  async findUnpaidDueUntil(endDate: Date): Promise<InstallmentItem[]> {
    const items = await prisma.installments.findMany({
      where: { isPaid: false, dueDate: { lte: endDate } },
      select: {
        id: true,
        expensesId: true,
        dueDate: true,
        isPaid: true,
        valueInstallmentOfExpense: true,
      },
    })

    return items.map(item => toInstallmentItem(item))
  }

  async markManyPaid(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return
    }

    await prisma.installments.updateMany({
      where: { id: { in: ids } },
      data: { isPaid: true },
    })
  }

  async sumUnpaidInRange(startDate: Date, endDate: Date): Promise<number> {
    const { _sum } = await prisma.installments.aggregate({
      _sum: { valueInstallmentOfExpense: true },
      where: {
        isPaid: false,
        dueDate: { gte: startDate, lte: endDate },
      },
    })

    return Number(_sum.valueInstallmentOfExpense ?? 0)
  }

  async findUnpaidInRangeWithDescription(
    startDate: Date,
    endDate: Date
  ): Promise<InstallmentWithExpenseDescription[]> {
    const items = await prisma.installments.findMany({
      where: {
        isPaid: false,
        dueDate: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        expensesId: true,
        dueDate: true,
        isPaid: true,
        valueInstallmentOfExpense: true,
        expense: {
          select: {
            description: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    return items.map(item => ({
      id: item.id,
      expensesId: item.expensesId,
      dueDate: item.dueDate,
      isPaid: item.isPaid,
      valueInstallmentOfExpense: Number(item.valueInstallmentOfExpense),
      expenseDescription: item.expense.description,
    }))
  }

  async findAllUnpaidWithDescription(): Promise<
    InstallmentWithExpenseDescription[]
  > {
    const items = await prisma.installments.findMany({
      where: { isPaid: false },
      select: {
        id: true,
        expensesId: true,
        dueDate: true,
        isPaid: true,
        valueInstallmentOfExpense: true,
        expense: {
          select: {
            description: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    return items.map(item => ({
      id: item.id,
      expensesId: item.expensesId,
      dueDate: item.dueDate,
      isPaid: item.isPaid,
      valueInstallmentOfExpense: Number(item.valueInstallmentOfExpense),
      expenseDescription: item.expense.description,
    }))
  }

  async updateUnpaidInstallmentAmountsByExpenseId(
    expensesId: string,
    installmentValue: number
  ): Promise<number> {
    const result = await prisma.installments.updateMany({
      where: {
        expensesId,
        isPaid: false,
      },
      data: {
        valueInstallmentOfExpense: new Prisma.Decimal(installmentValue),
      },
    })

    return result.count
  }
}
