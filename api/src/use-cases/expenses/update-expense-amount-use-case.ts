import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

interface Input {
  nameExpense: string
  amount: number
}

type UpdateExpenseAmountResult =
  | {
      status: 'updated'
      description: string
      oldAmount: number
      newAmount: number
    }
  | {
      status: 'not_found'
    }
  | {
      status: 'ambiguous'
      options: string[]
    }

export class UpdateExpenseAmountUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(input: Input): Promise<UpdateExpenseAmountResult> {
    const matches = await this.expensesRepository.findManyByDescriptionContains(
      input.nameExpense
    )

    if (matches.length === 0) {
      return { status: 'not_found' }
    }

    const uniqueDescriptions = Array.from(
      new Set(matches.map(item => item.description))
    )
    if (uniqueDescriptions.length > 1) {
      return {
        status: 'ambiguous',
        options: uniqueDescriptions,
      }
    }

    const expense = matches[0]
    const oldAmount = expense.amount

    await this.expensesRepository.updateAmountById(expense.id, input.amount)

    if (!expense.isFixed) {
      const unpaidCount =
        await this.installmentsRepository.countUnpaidByExpense(expense.id)
      if (unpaidCount > 0) {
        const newInstallmentValue = input.amount / unpaidCount
        await this.installmentsRepository.updateUnpaidInstallmentAmountsByExpenseId(
          expense.id,
          newInstallmentValue
        )
      }
    }

    return {
      status: 'updated',
      description: expense.description,
      oldAmount,
      newAmount: input.amount,
    }
  }
}
