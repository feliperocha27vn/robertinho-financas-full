import type { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../../lib/prisma'

interface GetSumExpensesFixedReply {
  totalFixedExpenses: string
  items?: {
    description: string
    amount: Decimal
    numberOfInstallments: number | null
  }[]
}

export async function getSumExpensesFixed(): Promise<GetSumExpensesFixedReply> {
  const { _sum } = await prisma.expenses.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      isFixed: true,
    },
  })

  const items = await prisma.expenses.findMany({
    where: {
      isFixed: true,
    },
    select: {
      description: true,
      amount: true,
      numberOfInstallments: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    totalFixedExpenses: _sum.amount?.toString() || '0',
    items,
  }
}
