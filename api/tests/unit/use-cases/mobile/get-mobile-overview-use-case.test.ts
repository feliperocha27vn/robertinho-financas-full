import { describe, expect, it, vi } from 'vitest'
import { GetMobileOverviewUseCase } from '../../../../src/use-cases/mobile/get-mobile-overview-use-case'

describe('GetMobileOverviewUseCase', () => {
  it('aggregates data from summary, accounts payable and remaining installments', async () => {
    const getHomeData = {
      execute: vi.fn().mockResolvedValue({
        balance: 1200,
        income: 4000,
        expense: 2800,
        recentTransactions: [
          {
            id: 'tx-1',
            description: 'Internet',
            amount: 150,
            category: 'RESIDENCE',
            date: new Date('2026-01-10T00:00:00.000Z'),
          },
        ],
      }),
    }

    const accountsToPayByDayFifteen = {
      execute: vi.fn().mockResolvedValue({
        accountsPayableMonth: [
          { description: 'Internet', amount: 150 },
          { description: 'Aluguel', amount: 1200 },
        ],
        totalAmountForPayByDayFifteen: 1350,
      }),
    }

    const getAllRemainingInstallments = {
      execute: vi.fn().mockResolvedValue({
        installments: [
          {
            expenseDescription: 'Notebook',
            remainingCount: 3,
            installmentValue: 500,
            totalRemaining: 1500,
          },
        ],
        totalOverallRemaining: 1500,
      }),
    }

    const sut = new GetMobileOverviewUseCase(
      getHomeData,
      accountsToPayByDayFifteen,
      getAllRemainingInstallments
    )

    const result = await sut.execute()

    expect(getHomeData.execute).toHaveBeenCalledTimes(1)
    expect(accountsToPayByDayFifteen.execute).toHaveBeenCalledTimes(1)
    expect(getAllRemainingInstallments.execute).toHaveBeenCalledTimes(1)

    expect(result).toEqual({
      summary: {
        balance: 1200,
        income: 4000,
        expense: 2800,
        recentTransactions: [
          {
            id: 'tx-1',
            description: 'Internet',
            amount: 150,
            category: 'RESIDENCE',
            date: new Date('2026-01-10T00:00:00.000Z'),
          },
        ],
      },
      accountsPayableByDayFifteen: {
        accountsPayableMonth: [
          { description: 'Internet', amount: 150 },
          { description: 'Aluguel', amount: 1200 },
        ],
        totalAmountForPayByDayFifteen: 1350,
      },
      remainingInstallments: {
        installments: [
          {
            expenseDescription: 'Notebook',
            remainingCount: 3,
            installmentValue: 500,
            totalRemaining: 1500,
          },
        ],
        totalOverallRemaining: 1500,
      },
    })
  })
})
