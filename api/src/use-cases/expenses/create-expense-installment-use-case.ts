import type { TransactionType } from '../../domain/finance'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

interface Input {
  description: string
  amount: number
  category: TransactionType
  numberOfInstallments: number
  firstDueDate: Date
}

export class CreateExpenseInstallmentUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(input: Input): Promise<void> {
    await this.expensesRepository.createInstallmentExpense({
      description: input.description,
      amount: input.amount,
      category: input.category,
      numberOfInstallments: input.numberOfInstallments,
      firstDueDate: input.firstDueDate,
    })
  }
}
