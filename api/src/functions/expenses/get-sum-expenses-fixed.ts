import { prisma } from '../../lib/prisma'

interface GetSumExpensesFixedReply {
  totalFixedExpenses: string
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

  return {
    totalFixedExpenses: _sum.amount?.toString() || '0',
  }
}
