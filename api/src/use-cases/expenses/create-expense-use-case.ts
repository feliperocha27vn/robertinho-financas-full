import type { TransactionType } from '../../domain/finance'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

interface Input {
  description: string
  amount: number
  category: TransactionType
  isFixed?: boolean
}

export class CreateExpenseUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(input: Input): Promise<void> {
    await this.expensesRepository.create({
      description: input.description,
      amount: input.amount,
      category: input.category,
      isFixed: input.isFixed ?? false,
    })
  }
}
