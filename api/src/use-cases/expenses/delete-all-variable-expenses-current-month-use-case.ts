import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

export class DeleteAllVariableExpensesCurrentMonthUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async preview(): Promise<{ count: number; total: number }> {
    const items = await this.expensesRepository.findVariableOneOffCurrentMonth()
    return {
      count: items.length,
      total: items.reduce((acc, item) => acc + item.amount, 0),
    }
  }

  async execute(): Promise<{ deletedCount: number; totalDeleted: number }> {
    const items = await this.expensesRepository.findVariableOneOffCurrentMonth()
    const deletedCount = await this.expensesRepository.deleteManyByIds(
      items.map(item => item.id)
    )

    return {
      deletedCount,
      totalDeleted: items.reduce((acc, item) => acc + item.amount, 0),
    }
  }
}
