import type { TransactionType } from '../../lib/types'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

interface Input {
  description: string
  amount: number
  category: TransactionType
  isFixed?: boolean
}

export interface ExpenseOutput {
  id: string
  description: string
  amount: number
  category: TransactionType
  isFixed: boolean
  numberOfInstallments: number | null
  createdAt: Date
}

export class CreateExpenseUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(input: Input): Promise<{ expense: ExpenseOutput }> {
    const createdExpense = await this.expensesRepository.create({
      description: input.description,
      amount: input.amount,
      category: input.category,
      isFixed: input.isFixed ?? false,
    })

    return { expense: createdExpense }
  }
}
