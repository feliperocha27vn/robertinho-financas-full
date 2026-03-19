import type { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../../lib/prisma'

interface RemainingInstallmentGroup {
  expenseDescription: string
  remainingCount: number
  installmentValue: Decimal
  totalRemaining: Decimal
}

interface GetAllRemainingInstallmentsReply {
  installments: RemainingInstallmentGroup[]
  totalOverallRemaining: number
}

export async function getAllRemainingInstallments(): Promise<GetAllRemainingInstallmentsReply> {
  const unpaidInstallments = await prisma.installments.findMany({
    where: {
      isPaid: false,
    },
    include: {
      expense: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  })

  const groups = new Map<string, RemainingInstallmentGroup>()

  for (const installment of unpaidInstallments) {
    const expenseId = installment.expensesId
    const existing = groups.get(expenseId)

    if (existing) {
      existing.remainingCount += 1
      existing.totalRemaining = existing.totalRemaining.plus(installment.valueInstallmentOfExpense)
    } else {
      groups.set(expenseId, {
        expenseDescription: installment.expense.description,
        remainingCount: 1,
        installmentValue: installment.valueInstallmentOfExpense,
        totalRemaining: installment.valueInstallmentOfExpense,
      })
    }
  }

  const installments = Array.from(groups.values())
  const totalOverallRemaining = installments.reduce(
    (acc, group) => acc + Number(group.totalRemaining),
    0
  )

  return {
    installments,
    totalOverallRemaining,
  }
}
