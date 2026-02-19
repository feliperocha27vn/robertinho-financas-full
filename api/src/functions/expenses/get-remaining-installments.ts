import type { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../../lib/prisma'

interface GetRemainingInstallmentsRquest {
  nameExpense: string
}

interface GetRemainingInstallmentsReply {
  remainingInstallments: number
  found: boolean
  expenseDescription?: string
  totalRemaining?: Decimal
  valueInstallmentOfExpense?: Decimal
}

export async function getRemainingInstallments({
  nameExpense,
}: GetRemainingInstallmentsRquest): Promise<GetRemainingInstallmentsReply> {
  const expense = await prisma.expenses.findFirst({
    where: {
      description: {
        contains: nameExpense,
        mode: 'insensitive',
      },
    },
  })

  if (!expense) {
    return {
      remainingInstallments: 0,
      found: false,
    }
  }

  const { valueInstallmentOfExpense } =
    await prisma.installments.findFirstOrThrow({
      where: { expensesId: expense.id, isPaid: false },
      select: { valueInstallmentOfExpense: true },
    })

  const remainingInstallments = await prisma.installments.count({
    where: { expensesId: expense.id, isPaid: false },
  })

  const totalRemaining = valueInstallmentOfExpense.times(remainingInstallments)

  return {
    remainingInstallments,
    found: true,
    expenseDescription: expense.description,
    totalRemaining,
    valueInstallmentOfExpense,
  }
}
