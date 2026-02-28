import { Prisma } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface GetSumExpensesOfLastMonthReply {
  totalExpensesOfLastMonth: Decimal | null
  items?: {
    description: string
    amount: Decimal
    numberOfInstallments: number | null
  }[]
}

export async function getSumExpensesOfLastMonthVariables(): Promise<GetSumExpensesOfLastMonthReply> {
  const lastMonth = subMonths(new Date(), 1)
  
  const whereClause = {
    createdAt: {
      gte: startOfMonth(lastMonth),
      lte: endOfMonth(lastMonth),
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

  const totalExpensesOfLastMonth: Decimal = _sum.amount ?? new Prisma.Decimal(0)

  return { totalExpensesOfLastMonth, items }
}
