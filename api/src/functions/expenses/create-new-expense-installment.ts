import { prisma } from '../../lib/prisma'

interface CreateExpenseRequest {
  description: string
  amount: number
  category: 'TRANSPORT' | 'OTHERS' | 'STUDIES' | 'RESIDENCE' | 'CREDIT'
  numberOfInstallments?: number
  firstDueDate?: Date
}

export async function createExpenseInstallment({
  description,
  amount,
  category,
  numberOfInstallments,
  firstDueDate,
}: CreateExpenseRequest) {
  const installmentsCount = numberOfInstallments || 1

  // Se for parcelado, usa transaction para criar expense + installments
  await prisma.$transaction(async tx => {
    // Cria a expense
    const expense = await tx.expenses.create({
      data: {
        description,
        amount,
        category,
        numberOfInstallments: installmentsCount,
      },
    })

    // Cria as datas de vencimento baseadas na primeira data informada
    const installmentsData = []
    const baseDueDate = firstDueDate || new Date() // Se não informado, usa hoje

    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date(baseDueDate)
      dueDate.setMonth(dueDate.getMonth() + i - 1) // Adiciona meses sequenciais

      installmentsData.push({
        expensesId: expense.id,
        dueDate,
        isPaid: false,
        valueInstallmentOfExpense: amount / installmentsCount,
      })
    }

    // Cria todas as parcelas
    await tx.installments.createMany({
      data: installmentsData,
    })
  })
}
