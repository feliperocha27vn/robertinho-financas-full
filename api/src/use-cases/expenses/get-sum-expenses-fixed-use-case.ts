import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

export class GetSumExpensesFixedUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(): Promise<{
    totalFixedExpenses: string
    items: {
      description: string
      amount: number
      numberOfInstallments: number | null
    }[]
  }> {
    const [items, total] = await Promise.all([
      this.expensesRepository.findFixed(),
      this.expensesRepository.sumFixed(),
    ])

    return {
      totalFixedExpenses: total.toString(),
      items: items.map(item => ({
        description: item.description,
        amount: item.amount,
        numberOfInstallments: item.numberOfInstallments,
      })),
    }
  }
}
