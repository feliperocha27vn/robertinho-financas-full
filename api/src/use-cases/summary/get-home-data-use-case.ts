import { endOfMonth, startOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'
import type { RecipesRepository } from '../../repositories/contracts/recipes-repository'

export class GetHomeDataUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository,
    private readonly recipesRepository: RecipesRepository
  ) {}

  async execute(): Promise<{
    balance: number
    income: number
    expense: number
    recentTransactions: {
      id: string
      description: string
      amount: number
      category: string
      date: Date
    }[]
  }> {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())

    const [
      fixedExpenses,
      variableExpensesMonth,
      currentMonthInstallments,
      income,
      allExpenses,
    ] = await Promise.all([
      this.expensesRepository.sumFixed(),
      this.expensesRepository.sumVariableOneOffInRange(start, end),
      this.installmentsRepository.sumUnpaidInRange(start, end),
      this.recipesRepository.sumInRange(start, end),
      this.expensesRepository.findAll(),
    ])

    const expense =
      fixedExpenses + variableExpensesMonth + currentMonthInstallments
    const balance = income - expense

    const recentTransactions = allExpenses
      .filter(item => !item.isFixed && item.numberOfInstallments === null)
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        category: item.category,
        date: item.createdAt,
      }))

    return {
      balance,
      income,
      expense,
      recentTransactions,
    }
  }
}
