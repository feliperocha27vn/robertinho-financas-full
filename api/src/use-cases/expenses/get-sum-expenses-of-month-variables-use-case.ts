import { endOfMonth, startOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

export class GetSumExpensesOfMonthVariablesUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(): Promise<{
    totalExpensesOfMonth: number
    items: {
      description: string
      amount: number
      numberOfInstallments: number | null
    }[]
  }> {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())

    const [items, total] = await Promise.all([
      this.expensesRepository.findVariableOneOffInRange(start, end),
      this.expensesRepository.sumVariableOneOffInRange(start, end),
    ])

    return {
      totalExpensesOfMonth: total,
      items: items.map(item => ({
        description: item.description,
        amount: item.amount,
        numberOfInstallments: item.numberOfInstallments,
      })),
    }
  }
}
