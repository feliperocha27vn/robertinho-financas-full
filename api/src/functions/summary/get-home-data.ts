import { endOfMonth, startOfMonth } from 'date-fns'
import { prisma } from "../../lib/prisma"

export async function getHomeData() {
  const start = startOfMonth(new Date())
  const end = endOfMonth(new Date())

  const [fixedExpenses, variableExpensesMonth, currentMonthInstallments, recipesMonth, recentTransactions] = await Promise.all([
    // Despesas fixas (burden mensal)
    prisma.expenses.aggregate({
      _sum: { amount: true },
      where: { isFixed: true }
    }),
    // Despesas variáveis do mês (compras únicas)
    prisma.expenses.aggregate({
      _sum: { amount: true },
      where: { 
        isFixed: false, 
        numberOfInstallments: null,
        createdAt: { gte: start, lte: end }
      }
    }),
    // Parcelas que vencem este mês
    prisma.installments.aggregate({
      _sum: { valueInstallmentOfExpense: true },
      where: { 
        dueDate: { gte: start, lte: end }
      }
    }),
    // Receitas deste mês
    prisma.recipes.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: start, lte: end } }
    }),
    // Transações recentes para a lista (apenas variáveis avulsas)
    prisma.expenses.findMany({
      where: {
        isFixed: false,
        numberOfInstallments: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
  ])

  const income = Number(recipesMonth._sum.amount || 0)
  const expense = Number(fixedExpenses._sum.amount || 0) + 
                  Number(variableExpensesMonth._sum.amount || 0) + 
                  Number(currentMonthInstallments._sum.valueInstallmentOfExpense || 0)
  
  const balance = income - expense

  return {
    balance,
    income,
    expense,
    recentTransactions: recentTransactions.map(e => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      category: e.category,
      date: e.createdAt,
    })),
  }
}
