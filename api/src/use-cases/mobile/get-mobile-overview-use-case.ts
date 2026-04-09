type HomeData = {
  balance: number
  income: number
  expense: number
  recentTransactions: {
    id: string
    description: string
    amount: number
    category: string
    date: Date
  }[]
}

type AccountsToPayByDayFifteenData = {
  accountsPayableMonth: {
    description: string
    amount: number
  }[]
  totalAmountForPayByDayFifteen: number
}

type RemainingInstallmentsData = {
  installments: {
    expenseDescription: string
    remainingCount: number
    installmentValue: number
    totalRemaining: number
  }[]
  totalOverallRemaining: number
}

interface GetHomeDataUseCase {
  execute(): Promise<HomeData>
}

interface AccountsToPayByDayFifteenUseCase {
  execute(): Promise<AccountsToPayByDayFifteenData>
}

interface GetAllRemainingInstallmentsUseCase {
  execute(): Promise<RemainingInstallmentsData>
}

export class GetMobileOverviewUseCase {
  constructor(
    private readonly getHomeData: GetHomeDataUseCase,
    private readonly accountsToPayByDayFifteen: AccountsToPayByDayFifteenUseCase,
    private readonly getAllRemainingInstallments: GetAllRemainingInstallmentsUseCase
  ) {}

  async execute(): Promise<{
    summary: HomeData
    accountsPayableByDayFifteen: AccountsToPayByDayFifteenData
    remainingInstallments: RemainingInstallmentsData
  }> {
    const [summary, accountsPayableByDayFifteen, remainingInstallments] =
      await Promise.all([
        this.getHomeData.execute(),
        this.accountsToPayByDayFifteen.execute(),
        this.getAllRemainingInstallments.execute(),
      ])

    return {
      summary,
      accountsPayableByDayFifteen,
      remainingInstallments,
    }
  }
}
