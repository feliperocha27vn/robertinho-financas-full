import { Prisma } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'
import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface GetSumExpensesOfMonthReply {
  totalExpensesOfMonth: Decimal | null
}

export async function getSumExpensesOfMonthVariables(): Promise<GetSumExpensesOfMonthReply> {
  const { _sum } = await prisma.expenses.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      createdAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
      isFixed: false,
      numberOfInstallments: null,
    },
  })

  const totalExpensesOfMonth: Decimal = _sum.amount ?? new Prisma.Decimal(0)

  return { totalExpensesOfMonth }
}
