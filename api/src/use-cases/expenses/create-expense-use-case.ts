import { endOfMonth, startOfMonth } from 'date-fns'
import type { TransactionType } from '../../domain/finance'
import { MessageFormatter } from '../../presenters/message-formatter'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

interface Input {
  description: string
  amount: number
  category: TransactionType
  isFixed?: boolean
}

export class CreateExpenseUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(input: Input): Promise<{ message: string }> {
    const createdExpense = await this.expensesRepository.create({
      description: input.description,
      amount: input.amount,
      category: input.category,
      isFixed: input.isFixed ?? false,
    })

    const monthPartialTotal =
      await this.expensesRepository.sumVariableOneOffInRange(
        startOfMonth(new Date()),
        endOfMonth(new Date())
      )

    return {
      message: MessageFormatter.createExpenseSuccess({
        description: createdExpense.description,
        amount: createdExpense.amount,
        category: createdExpense.category,
        createdAt: createdExpense.createdAt,
        isFixed: createdExpense.isFixed,
        monthPartialTotal,
      }),
    }
  }
}
