import type { Decimal } from '@prisma/client/runtime/library'
import { endOfMonth, startOfMonth, subDays } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface AccountsPayableMonthReply {
  accountsPayableMonth: {
    description: string
    amount: Decimal
  }[]
  totalAmountForPayByDayFifteen: number
}

export async function accountsToPayByDayFifteen(): Promise<AccountsPayableMonthReply> {
  const accountsFixed = await prisma.expenses.findMany({
    select: {
      description: true,
      amount: true,
    },
    where: {
      isFixed: true,
    },
  })

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
      dueDate: {
        gte: startOfMonth(new Date()),
        lte: subDays(endOfMonth(new Date()), 10),
      },
    },
  })

  const accountsPayableMonth = [
    ...accountsFixed.map(account => ({
      description: account.description,
      amount: account.amount,
    })),
    ...accountsInstallments.map(account => ({
      description: account.expense.description,
      amount: account.valueInstallmentOfExpense,
    })),
  ]

  const totalAmountForPayByDayFifteen = accountsPayableMonth.reduce(
    (total, account) => {
      return total + Number(account.amount)
    },
    0
  )

  return {
    accountsPayableMonth,
    totalAmountForPayByDayFifteen,
  }
}
