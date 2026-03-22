import { endOfMonth, startOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

interface Input {
  nameExpense: string
}

export class PayInstallmentUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(input: Input): Promise<{ found: boolean; success?: boolean }> {
    const expense = await this.expensesRepository.findByDescriptionContains(
      input.nameExpense
    )

    if (!expense) {
      return { found: false }
    }

    if (expense.isFixed) {
      const alreadyPaid =
        await this.installmentsRepository.findFirstPaidOfMonthByExpense(
          expense.id,
          new Date()
        )

      if (alreadyPaid) {
        throw new Error(
          `A despesa fixa "${expense.description}" ja consta como paga neste mes.`
        )
      }

      await this.installmentsRepository.create({
        expensesId: expense.id,
        dueDate: new Date(),
        isPaid: true,
        valueInstallmentOfExpense: expense.amount,
      })

      return { found: true, success: true }
    }

    const nextInstallment =
      await this.installmentsRepository.findNextUnpaidByExpense(expense.id)

    if (!nextInstallment) {
      throw new Error(
        `Todas as parcelas da despesa "${expense.description}" ja foram pagas.`
      )
    }

    await this.installmentsRepository.updatePaidStatusById(
      nextInstallment.id,
      true
    )

    return { found: true, success: true }
  }
}
