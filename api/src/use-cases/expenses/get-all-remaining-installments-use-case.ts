import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

export class GetAllRemainingInstallmentsUseCase {
  constructor(
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(): Promise<{
    installments: {
      expenseDescription: string
      remainingCount: number
      installmentValue: number
      totalRemaining: number
    }[]
    totalOverallRemaining: number
  }> {
    const unpaid =
      await this.installmentsRepository.findAllUnpaidWithDescription()
    const grouped = new Map<
      string,
      {
        expenseDescription: string
        remainingCount: number
        installmentValue: number
        totalRemaining: number
      }
    >()

    for (const item of unpaid) {
      const existing = grouped.get(item.expensesId)

      if (existing) {
        existing.remainingCount += 1
        existing.totalRemaining += item.valueInstallmentOfExpense
      } else {
        grouped.set(item.expensesId, {
          expenseDescription: item.expenseDescription,
          remainingCount: 1,
          installmentValue: item.valueInstallmentOfExpense,
          totalRemaining: item.valueInstallmentOfExpense,
        })
      }
    }

    const installments = Array.from(grouped.values())
    const totalOverallRemaining = installments.reduce(
      (acc, item) => acc + item.totalRemaining,
      0
    )

    return {
      installments,
      totalOverallRemaining,
    }
  }
}
