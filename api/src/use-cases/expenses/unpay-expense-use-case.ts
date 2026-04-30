import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

interface Input {
  nameExpense: string
}

export class UnpayExpenseUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(input: Input): Promise<{
    found: boolean
    success?: boolean
    alreadyUnpaid?: boolean
    expenseDescription?: string
  }> {
    const expense = await this.expensesRepository.findByDescriptionContains(
      input.nameExpense
    )
    if (!expense) {
      return { found: false }
    }

    if (expense.isFixed) {
      const paidThisMonth =
        await this.installmentsRepository.findFirstPaidOfMonthByExpense(
          expense.id,
          new Date()
        )

      if (!paidThisMonth) {
        return {
          found: true,
          alreadyUnpaid: true,
          expenseDescription: expense.description,
        }
      }

      await this.installmentsRepository.deleteById(paidThisMonth.id)

      return {
        found: true,
        success: true,
        expenseDescription: expense.description,
      }
    }

    const latestPaid =
      await this.installmentsRepository.findLatestPaidByExpense(expense.id)
    if (!latestPaid) {
      return {
        found: true,
        alreadyUnpaid: true,
        expenseDescription: expense.description,
      }
    }

    await this.installmentsRepository.updatePaidStatusById(latestPaid.id, false)

    return {
      found: true,
      success: true,
      expenseDescription: expense.description,
    }
  }
}
