import { Prisma } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'
import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface GetSumExpensesOfMonthReply {
  totalExpensesOfMonth: Decimal | null
  items?: {
    description: string
    amount: Decimal
    numberOfInstallments: number | null
  }[]
}

export async function getSumExpensesOfMonthVariables(): Promise<GetSumExpensesOfMonthReply> {
  const whereClause = {
    createdAt: {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    },
    isFixed: false,
    numberOfInstallments: null,
  }

  const { _sum } = await prisma.expenses.aggregate({
    _sum: {
      amount: true,
    },
    where: whereClause,
  })

  const items = await prisma.expenses.findMany({
    where: whereClause,
    select: {
      description: true,
      amount: true,
      numberOfInstallments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const totalExpensesOfMonth: Decimal = _sum.amount ?? new Prisma.Decimal(0)

  return { totalExpensesOfMonth, items }
}
