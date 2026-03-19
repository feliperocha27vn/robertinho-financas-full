import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface UnpayExpenseRequest {
  nameExpense: string
}

export async function unpayExpense({ nameExpense }: UnpayExpenseRequest) {
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
      found: false,
    }
  }

  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())

  if (expense.isFixed) {
    // Para despesas fixas, procuramos se existe um pagamento registrado neste mês e deletamos
    const paidInstallmentThisMonth = await prisma.installments.findFirst({
      where: {
        expensesId: expense.id,
        isPaid: true,
        dueDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    })

    if (!paidInstallmentThisMonth) {
      return {
        found: true,
        expenseDescription: expense.description,
        alreadyUnpaid: true,
      }
    }

    await prisma.installments.delete({
      where: { id: paidInstallmentThisMonth.id },
    })

    return {
      found: true,
      expenseDescription: expense.description,
      success: true,
    }
  }

  // Para despesas parceladas/normais, procuramos a parcela que foi paga neste mês PRIMEIRO
  // Caso não encontre, pegamos a última parcela paga de qualquer mês (fallback)
  
  let targetInstallment = await prisma.installments.findFirst({
    where: {
      expensesId: expense.id,
      isPaid: true,
      dueDate: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
  })

  if (!targetInstallment) {
    targetInstallment = await prisma.installments.findFirst({
      where: {
        expensesId: expense.id,
        isPaid: true,
      },
      orderBy: {
        dueDate: 'desc',
      },
    })
  }

  if (!targetInstallment) {
    return {
      found: true,
      expenseDescription: expense.description,
      alreadyUnpaid: true,
    }
  }

  await prisma.installments.update({
    where: { id: targetInstallment.id },
    data: { isPaid: false },
  })

  return {
    found: true,
    expenseDescription: expense.description,
    success: true,
  }
}
