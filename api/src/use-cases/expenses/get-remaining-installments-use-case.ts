import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

interface Input {
  nameExpense: string
}

export class GetRemainingInstallmentsUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(input: Input): Promise<{
    remainingInstallments: number
    found: boolean
    expenseDescription?: string
    totalRemaining?: number
    valueInstallmentOfExpense?: number
  }> {
    const expense = await this.expensesRepository.findByDescriptionContains(
      input.nameExpense
    )

    if (!expense) {
      return {
        remainingInstallments: 0,
        found: false,
      }
    }

    const firstUnpaid =
      await this.installmentsRepository.findFirstUnpaidByExpense(expense.id)
    if (!firstUnpaid) {
      return {
        remainingInstallments: 0,
        found: true,
        expenseDescription: expense.description,
        totalRemaining: 0,
      }
    }

    const remainingInstallments =
      await this.installmentsRepository.countUnpaidByExpense(expense.id)
    const totalRemaining =
      firstUnpaid.valueInstallmentOfExpense * remainingInstallments

    return {
      remainingInstallments,
      found: true,
      expenseDescription: expense.description,
      totalRemaining,
      valueInstallmentOfExpense: firstUnpaid.valueInstallmentOfExpense,
    }
  }
}
