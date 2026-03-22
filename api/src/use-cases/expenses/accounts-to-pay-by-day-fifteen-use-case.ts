import { endOfMonth, startOfMonth, subDays } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

export class AccountsToPayByDayFifteenUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(): Promise<{
    accountsPayableMonth: { description: string; amount: number }[]
    totalAmountForPayByDayFifteen: number
  }> {
    const fixed = await this.expensesRepository.findFixed()
    const installments =
      await this.installmentsRepository.findUnpaidInRangeWithDescription(
        startOfMonth(new Date()),
        subDays(endOfMonth(new Date()), 10)
      )

    const accountsPayableMonth = [
      ...fixed.map(item => ({
        description: item.description,
        amount: item.amount,
      })),
      ...installments.map(item => ({
        description: item.expenseDescription,
        amount: item.valueInstallmentOfExpense,
      })),
    ]

    const totalAmountForPayByDayFifteen = accountsPayableMonth.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    )

    return {
      accountsPayableMonth,
      totalAmountForPayByDayFifteen,
    }
  }
}
