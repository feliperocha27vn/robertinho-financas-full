import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from '../../lib/prisma'

interface PaidingAllUnpaidCurrentMonthReply {
  success: boolean
  paidCount: number
}

export async function paidingAllUnpaidCurrentMonth(): Promise<PaidingAllUnpaidCurrentMonthReply> {
  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())

  let paidCount = 0

  // 1. Tratamento para despesas FIXAS
  // Precisamos encontrar as despesas fixas que NÃO têm pagamento neste mês
  const accountsFixed = await prisma.expenses.findMany({
    select: { id: true, amount: true },
    where: { isFixed: true },
  })

  const paidFixedInstallmentsThisMonth = await prisma.installments.findMany({
    where: {
      isPaid: true,
      dueDate: { gte: currentMonthStart, lte: currentMonthEnd },
      expensesId: { in: accountsFixed.map(a => a.id) },
    },
    select: { expensesId: true },
  })

  const paidFixedIds = paidFixedInstallmentsThisMonth.map(p => p.expensesId)
  const unpaidFixed = accountsFixed.filter(account => !paidFixedIds.includes(account.id))

  // Criamos uma parcela "paga" para cada despesa fixa pendente
  if (unpaidFixed.length > 0) {
    await prisma.installments.createMany({
      data: unpaidFixed.map(expense => ({
        isPaid: true,
        dueDate: new Date(),
        valueInstallmentOfExpense: expense.amount,
        expensesId: expense.id,
      })),
    })
    paidCount += unpaidFixed.length
  }

  // 2. Tratamento para as parcelas pendentes (não fixas e parceladas normais) até o final do mês
  const pendingInstallments = await prisma.installments.findMany({
    where: {
      isPaid: false,
      dueDate: { lte: currentMonthEnd },
    },
    select: { id: true },
  })

  const pendingInstallmentIds = pendingInstallments.map(i => i.id)

  if (pendingInstallmentIds.length > 0) {
    await prisma.installments.updateMany({
      where: { id: { in: pendingInstallmentIds } },
      data: { isPaid: true },
    })
    paidCount += pendingInstallmentIds.length
  }

  return { success: true, paidCount }
}
