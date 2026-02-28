import type { Decimal } from '@prisma/client/runtime/library'
import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface UnpaidExpensesOfCurrentMonthReply {
  unpaidExpenses: {
    description: string
    amount: Decimal
  }[]
  totalUnpaidAmount: number
}

export async function unpaidExpensesOfCurrentMonth(): Promise<UnpaidExpensesOfCurrentMonthReply> {
  const endOfThisMonth = endOfMonth(new Date())
  const startOfThisMonth = startOfMonth(new Date())

  const accountsFixed = await prisma.expenses.findMany({
    select: {
      id: true,
      description: true,
      amount: true,
    },
    where: {
      isFixed: true,
    },
  })

  // Para despesas fixas, verificamos se já foi gerado um registro de pagamento (Installment) neste mês.
  const paidFixedInstallmentsThisMonth = await prisma.installments.findMany({
    where: {
      isPaid: true,
      dueDate: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
      expensesId: {
        in: accountsFixed.map(a => a.id),
      },
    },
    select: {
      expensesId: true,
    },
  })

  const paidFixedIds = paidFixedInstallmentsThisMonth.map(p => p.expensesId)
  const unpaidFixed = accountsFixed.filter(account => !paidFixedIds.includes(account.id))

  const accountsInstallments = await prisma.installments.findMany({
    select: {
      valueInstallmentOfExpense: true,
      expense: {
        select: {
          description: true,
        },
      },
    },
    where: {
      isPaid: false,
      dueDate: {
        lte: endOfThisMonth,
      },
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  const unpaidExpenses = [
    ...unpaidFixed.map(account => ({
      description: account.description,
      amount: account.amount,
    })),
    ...accountsInstallments.map(account => ({
      description: account.expense.description,
      amount: account.valueInstallmentOfExpense,
    })),
  ]

  const totalUnpaidAmount = unpaidExpenses.reduce(
    (total, account) => {
      return total + Number(account.amount)
    },
    0
  )

  return {
    unpaidExpenses,
    totalUnpaidAmount,
  }
}
