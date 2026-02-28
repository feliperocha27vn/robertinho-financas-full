import { endOfMonth, startOfMonth } from 'date-fns'
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

  // Tratamento para despesa que é fixa:
  if (expense.isFixed) {
    const currentMonthStart = startOfMonth(new Date())
    const currentMonthEnd = endOfMonth(new Date())

    // Verifica se já não foi paga neste mês
    const alreadyPaid = await prisma.installments.findFirst({
      where: {
        expensesId: expense.id,
        isPaid: true,
        dueDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    })

    if (alreadyPaid) {
      throw new Error(`A despesa fixa "${expense.description}" já consta como paga neste mês.`)
    }

    // Cria um registro de "parcela" para sinalizar que foi paga neste mês
    await prisma.installments.create({
      data: {
        isPaid: true,
        dueDate: new Date(),
        valueInstallmentOfExpense: expense.amount,
        expensesId: expense.id,
      },
    })

    return { success: true }
  }

  // Tratamento para parcela de conta não fixa:
  const nextInstallment = await prisma.installments.findFirst({
    where: { expensesId: expense.id, isPaid: false },
    orderBy: { dueDate: 'asc' },
  })

  if (!nextInstallment) {
    throw new Error(`Todas as parcelas da despesa "${expense.description}" já foram pagas.`)
  }

  await prisma.installments.update({
    where: { id: nextInstallment.id },
    data: { isPaid: true },
  })

  return { success: true }
}
