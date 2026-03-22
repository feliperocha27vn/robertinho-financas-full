import { addMonths, endOfMonth, startOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

export class AccountsPayableNextMonthUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(): Promise<{
    accountsPayableNextMonth: { description: string; amount: number }[]
    totalAmountForPayableNextMonth: number
  }> {
    const fixed = await this.expensesRepository.findFixed()

    const nextMonth = addMonths(new Date(), 1)
    const installments =
      await this.installmentsRepository.findUnpaidInRangeWithDescription(
        startOfMonth(nextMonth),
        endOfMonth(nextMonth)
      )

    const accountsPayableNextMonth = [
      ...fixed.map(item => ({
        description: item.description,
        amount: item.amount,
      })),
      ...installments.map(item => ({
        description: item.expenseDescription,
        amount: item.valueInstallmentOfExpense,
      })),
    ]

    const totalAmountForPayableNextMonth = accountsPayableNextMonth.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    )

    return {
      accountsPayableNextMonth,
      totalAmountForPayableNextMonth,
    }
  }
}
