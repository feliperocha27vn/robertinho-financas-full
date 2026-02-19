import type { Decimal } from '@prisma/client/runtime/library'
import { addMonths, endOfMonth, startOfMonth, subDays } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface AccountsPayableNextMonthReply {
  accountsPayableNextMonth: {
    description: string
    amount: Decimal
  }[]
  totalAmountForPayableNextMonth: number
}

export async function accountsPayableNextMonth(): Promise<AccountsPayableNextMonthReply> {
  const accountsFixed = await prisma.expenses.findMany({
    select: {
      description: true,
      amount: true,
    },
    where: {
      isFixed: true,
    },
  })

  const endDateNextMonth = endOfMonth(addMonths(new Date(), 1))

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
        gte: startOfMonth(addMonths(new Date(), 1)),
        lte: subDays(endDateNextMonth, 10),
      },
    },
  })

  const accountsPayableNextMonth = [
    ...accountsFixed.map(account => ({
      description: account.description,
      amount: account.amount,
    })),
    ...accountsInstallments.map(account => ({
      description: account.expense.description,
      amount: account.valueInstallmentOfExpense,
    })),
  ]

  const totalAmountForPayableNextMonth = accountsPayableNextMonth.reduce(
    (total, account) => {
      return total + Number(account.amount)
    },
    0
  )

  return {
    accountsPayableNextMonth,
    totalAmountForPayableNextMonth,
  }
}
