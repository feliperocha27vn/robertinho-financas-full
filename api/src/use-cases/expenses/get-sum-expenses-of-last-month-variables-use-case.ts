import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

export class GetSumExpensesOfLastMonthVariablesUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(): Promise<{
    totalExpensesOfLastMonth: number
    items: {
      description: string
      amount: number
      numberOfInstallments: number | null
    }[]
  }> {
    const month = subMonths(new Date(), 1)
    const start = startOfMonth(month)
    const end = endOfMonth(month)

    const [items, total] = await Promise.all([
      this.expensesRepository.findVariableOneOffInRange(start, end),
      this.expensesRepository.sumVariableOneOffInRange(start, end),
    ])

    return {
      totalExpensesOfLastMonth: total,
      items: items.map(item => ({
        description: item.description,
        amount: item.amount,
        numberOfInstallments: item.numberOfInstallments,
      })),
    }
  }
}
