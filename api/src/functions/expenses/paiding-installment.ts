import { prisma } from '../../lib/prisma'

interface PaidingInstallmentRequest {
  nameExpense: string
}

export async function paidingInstallment({
  nameExpense,
}: PaidingInstallmentRequest) {
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

  const nextInstallment = await prisma.installments.findFirst({
    where: { expensesId: expense.id, isPaid: false },
    orderBy: { dueDate: 'asc' },
  })

  if (!nextInstallment) {
    throw new Error('Todas as parcelas já foram pagas.')
  }

  await prisma.installments.update({
    where: { id: nextInstallment.id },
    data: { isPaid: true },
  })
}
