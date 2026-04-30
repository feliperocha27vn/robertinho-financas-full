import { Prisma } from '@prisma/client'
import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../../../lib/prisma'
import type { InstallmentItem } from '../../../lib/types'
import { withPrismaRetry } from '../../../utils/prisma-retry'
import type {
  CreateInstallmentInput,
  InstallmentsRepository,
  InstallmentWithExpenseDescription,
} from '../../contracts/installments-repository'

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
    const created = await withPrismaRetry(
      () =>
        prisma.installments.create({
          data: {
            expensesId: input.expensesId,
            dueDate: input.dueDate,
            isPaid: input.isPaid,
            valueInstallmentOfExpense: new Prisma.Decimal(
              input.valueInstallmentOfExpense
            ),
          },
        }),
      'installmentsRepository.create'
    )

    return toInstallmentItem(created)
  }

  async createMany(inputs: CreateInstallmentInput[]): Promise<void> {
    await withPrismaRetry(
      () =>
        prisma.installments.createMany({
          data: inputs.map(input => ({
            expensesId: input.expensesId,
            dueDate: input.dueDate,
            isPaid: input.isPaid,
            valueInstallmentOfExpense: new Prisma.Decimal(
              input.valueInstallmentOfExpense
            ),
          })),
        }),
      'installmentsRepository.createMany'
    )
  }

  async findFirstPaidOfMonthByExpense(
    expensesId: string,
    monthDate: Date
  ): Promise<InstallmentItem | null> {
    const item = await withPrismaRetry(
      () =>
        prisma.installments.findFirst({
          where: {
            expensesId,
            isPaid: true,
            dueDate: {
              gte: startOfMonth(monthDate),
              lte: endOfMonth(monthDate),
            },
          },
        }),
      'installmentsRepository.findFirstPaidOfMonthByExpense'
    )

    return item ? toInstallmentItem(item) : null
  }

  async findNextUnpaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const item = await withPrismaRetry(
      () =>
        prisma.installments.findFirst({
          where: { expensesId, isPaid: false },
          orderBy: { dueDate: 'asc' },
        }),
      'installmentsRepository.findNextUnpaidByExpense'
    )

    return item ? toInstallmentItem(item) : null
  }

  async findLatestPaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const item = await withPrismaRetry(
      () =>
        prisma.installments.findFirst({
          where: { expensesId, isPaid: true },
          orderBy: { dueDate: 'desc' },
        }),
      'installmentsRepository.findLatestPaidByExpense'
    )

    return item ? toInstallmentItem(item) : null
  }

  async findFirstUnpaidByExpense(
    expensesId: string
  ): Promise<InstallmentItem | null> {
    const item = await withPrismaRetry(
      () =>
        prisma.installments.findFirst({
          where: { expensesId, isPaid: false },
          orderBy: { dueDate: 'asc' },
        }),
      'installmentsRepository.findFirstUnpaidByExpense'
    )

    return item ? toInstallmentItem(item) : null
  }

  async countUnpaidByExpense(expensesId: string): Promise<number> {
    return withPrismaRetry(
      () => prisma.installments.count({ where: { expensesId, isPaid: false } }),
      'installmentsRepository.countUnpaidByExpense'
    )
  }

  async updatePaidStatusById(id: string, isPaid: boolean): Promise<void> {
    await withPrismaRetry(
      () => prisma.installments.update({ where: { id }, data: { isPaid } }),
      'installmentsRepository.updatePaidStatusById'
    )
  }

  async deleteById(id: string): Promise<void> {
    await withPrismaRetry(
      () => prisma.installments.delete({ where: { id } }),
      'installmentsRepository.deleteById'
    )
  }

  async findPaidFixedExpenseIdsInMonth(
    expenseIds: string[],
    monthDate: Date
  ): Promise<string[]> {
    if (expenseIds.length === 0) {
      return []
    }

    const items = await withPrismaRetry(
      () =>
        prisma.installments.findMany({
          where: {
            isPaid: true,
            dueDate: {
              gte: startOfMonth(monthDate),
              lte: endOfMonth(monthDate),
            },
            expensesId: { in: expenseIds },
          },
          select: { expensesId: true },
        }),
      'installmentsRepository.findPaidFixedExpenseIdsInMonth'
    )

    return Array.from(new Set(items.map(item => item.expensesId)))
  }

  async findUnpaidDueUntil(endDate: Date): Promise<InstallmentItem[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.installments.findMany({
          where: { isPaid: false, dueDate: { lte: endDate } },
          select: {
            id: true,
            expensesId: true,
            dueDate: true,
            isPaid: true,
            valueInstallmentOfExpense: true,
          },
        }),
      'installmentsRepository.findUnpaidDueUntil'
    )

    return items.map(item => toInstallmentItem(item))
  }

  async markManyPaid(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return
    }

    await withPrismaRetry(
      () =>
        prisma.installments.updateMany({
          where: { id: { in: ids } },
          data: { isPaid: true },
        }),
      'installmentsRepository.markManyPaid'
    )
  }

  async sumUnpaidInRange(startDate: Date, endDate: Date): Promise<number> {
    const { _sum } = await withPrismaRetry(
      () =>
        prisma.installments.aggregate({
          _sum: { valueInstallmentOfExpense: true },
          where: {
            isPaid: false,
            dueDate: { gte: startDate, lte: endDate },
          },
        }),
      'installmentsRepository.sumUnpaidInRange'
    )

    return Number(_sum.valueInstallmentOfExpense ?? 0)
  }

  async findUnpaidInRangeWithDescription(
    startDate: Date,
    endDate: Date
  ): Promise<InstallmentWithExpenseDescription[]> {
    const items = await withPrismaRetry(
      () =>
        prisma.installments.findMany({
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
        }),
      'installmentsRepository.findUnpaidInRangeWithDescription'
    )

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
    const items = await withPrismaRetry(
      () =>
        prisma.installments.findMany({
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
        }),
      'installmentsRepository.findAllUnpaidWithDescription'
    )

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
    const result = await withPrismaRetry(
      () =>
        prisma.installments.updateMany({
          where: {
            expensesId,
            isPaid: false,
          },
          data: {
            valueInstallmentOfExpense: new Prisma.Decimal(installmentValue),
          },
        }),
      'installmentsRepository.updateUnpaidInstallmentAmountsByExpenseId'
    )

    return result.count
  }
}
