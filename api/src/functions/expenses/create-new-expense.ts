import { prisma } from '../../lib/prisma'

interface CreateExpenseRequest {
  description: string
  amount: number
  category: 'TRANSPORT' | 'OTHERS' | 'STUDIES' | 'RESIDENCE' | 'CREDIT'
  isFixed?: boolean
}

export async function createExpense({
  description,
  amount,
  category,
  isFixed = false,
}: CreateExpenseRequest) {
  await prisma.expenses.create({
    data: {
      description,
      amount,
      category,
      isFixed,
    },
  })
}
