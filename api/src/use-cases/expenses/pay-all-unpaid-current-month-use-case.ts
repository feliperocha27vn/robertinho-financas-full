import { endOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

export class PayAllUnpaidCurrentMonthUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(): Promise<{ success: boolean; paidCount: number }> {
    let paidCount = 0

    const fixedExpenses = await this.expensesRepository.findAllFixedForStatus()
    const paidFixedIds =
      await this.installmentsRepository.findPaidFixedExpenseIdsInMonth(
        fixedExpenses.map(item => item.id),
        new Date()
      )

    const unpaidFixed = fixedExpenses.filter(
      item => !paidFixedIds.includes(item.id)
    )

    if (unpaidFixed.length > 0) {
      await this.installmentsRepository.createMany(
        unpaidFixed.map(expense => ({
          expensesId: expense.id,
          dueDate: new Date(),
          isPaid: true,
          valueInstallmentOfExpense: expense.amount,
        }))
      )
      paidCount += unpaidFixed.length
    }

    const pendingInstallments =
      await this.installmentsRepository.findUnpaidDueUntil(
        endOfMonth(new Date())
      )
    if (pendingInstallments.length > 0) {
      await this.installmentsRepository.markManyPaid(
        pendingInstallments.map(item => item.id)
      )
      paidCount += pendingInstallments.length
    }

    return { success: true, paidCount }
  }
}
