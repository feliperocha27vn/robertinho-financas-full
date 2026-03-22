import { endOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

export class GetUnpaidExpensesOfCurrentMonthUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(): Promise<{
    unpaidExpenses: { description: string; amount: number }[]
    totalUnpaidAmount: number
  }> {
    const fixed = await this.expensesRepository.findAllFixedForStatus()
    const paidFixedIds =
      await this.installmentsRepository.findPaidFixedExpenseIdsInMonth(
        fixed.map(item => item.id),
        new Date()
      )

    const unpaidFixed = fixed.filter(item => !paidFixedIds.includes(item.id))
    const installmentUnpaid =
      await this.installmentsRepository.findUnpaidInRangeWithDescription(
        new Date('1970-01-01T00:00:00.000Z'),
        endOfMonth(new Date())
      )

    const unpaidExpenses = [
      ...unpaidFixed.map(item => ({
        description: item.description,
        amount: item.amount,
      })),
      ...installmentUnpaid.map(item => ({
        description: item.expenseDescription,
        amount: item.valueInstallmentOfExpense,
      })),
    ]

    const totalUnpaidAmount = unpaidExpenses.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    )

    return {
      unpaidExpenses,
      totalUnpaidAmount,
    }
  }
}
