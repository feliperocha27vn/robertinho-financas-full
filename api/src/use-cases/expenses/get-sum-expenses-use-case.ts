import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

export class GetSumExpensesUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(): Promise<{
    totalExpenses: string
    items: {
      description: string
      amount: number
      numberOfInstallments: number | null
    }[]
  }> {
    const [items, total] = await Promise.all([
      this.expensesRepository.findAll(),
      this.expensesRepository.sumAll(),
    ])

    return {
      totalExpenses: total.toString(),
      items: items.map(item => ({
        description: item.description,
        amount: item.amount,
        numberOfInstallments: item.numberOfInstallments,
      })),
    }
  }
}
