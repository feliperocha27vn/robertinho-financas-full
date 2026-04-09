import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from '../../../src/app'
import { resetContainer, setContainer } from '../../../src/container'

describe('Mobile routes', () => {
  beforeEach(() => {
    process.env.MOBILE_APP_TOKEN = 'mobile-secret'
  })

  afterEach(async () => {
    resetContainer()
    delete process.env.MOBILE_APP_TOKEN
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns mobile overview', async () => {
    const getMobileOverviewExecute = vi.fn().mockResolvedValue({
      summary: {
        balance: 1200,
        income: 4000,
        expense: 2800,
        recentTransactions: [],
      },
      accountsPayableByDayFifteen: {
        accountsPayableMonth: [{ description: 'Internet', amount: 150 }],
        totalAmountForPayByDayFifteen: 150,
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

    setContainer({
      processMessage: {
        execute: vi.fn().mockResolvedValue({ message: 'ok' }),
      },
      getHomeData: {
        execute: vi.fn().mockResolvedValue({
          balance: 0,
          income: 0,
          expense: 0,
          recentTransactions: [],
        }),
      },
      accountsToPayByDayFifteen: {
        execute: vi.fn().mockResolvedValue({
          accountsPayableMonth: [],
          totalAmountForPayByDayFifteen: 0,
        }),
      },
      getAllRemainingInstallments: {
        execute: vi.fn().mockResolvedValue({
          installments: [],
          totalOverallRemaining: 0,
        }),
      },
      getMobileOverview: {
        execute: getMobileOverviewExecute,
      },
    })

    await app.ready()

    const response = await request(app.server)
      .get('/mobile/overview')
      .set('authorization', 'Bearer mobile-secret')

    expect(response.status).toBe(200)
    expect(getMobileOverviewExecute).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual({
      summary: {
        balance: 1200,
        income: 4000,
        expense: 2800,
        recentTransactions: [],
      },
      accountsPayableByDayFifteen: {
        accountsPayableMonth: [{ description: 'Internet', amount: 150 }],
        totalAmountForPayByDayFifteen: 150,
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

  it('returns summary, accounts payable and remaining installments routes', async () => {
    const getHomeDataExecute = vi.fn().mockResolvedValue({
      balance: 500,
      income: 2500,
      expense: 2000,
      recentTransactions: [],
    })
    const accountsToPayByDayFifteenExecute = vi.fn().mockResolvedValue({
      accountsPayableMonth: [{ description: 'Aluguel', amount: 1200 }],
      totalAmountForPayByDayFifteen: 1200,
    })
    const getAllRemainingInstallmentsExecute = vi.fn().mockResolvedValue({
      installments: [
        {
          expenseDescription: 'TV',
          remainingCount: 2,
          installmentValue: 300,
          totalRemaining: 600,
        },
      ],
      totalOverallRemaining: 600,
    })

    setContainer({
      processMessage: {
        execute: vi.fn().mockResolvedValue({ message: 'ok' }),
      },
      getHomeData: {
        execute: getHomeDataExecute,
      },
      accountsToPayByDayFifteen: {
        execute: accountsToPayByDayFifteenExecute,
      },
      getAllRemainingInstallments: {
        execute: getAllRemainingInstallmentsExecute,
      },
      getMobileOverview: {
        execute: vi.fn().mockResolvedValue({
          summary: {
            balance: 0,
            income: 0,
            expense: 0,
            recentTransactions: [],
          },
          accountsPayableByDayFifteen: {
            accountsPayableMonth: [],
            totalAmountForPayByDayFifteen: 0,
          },
          remainingInstallments: {
            installments: [],
            totalOverallRemaining: 0,
          },
        }),
      },
    })

    await app.ready()

    const summaryResponse = await request(app.server)
      .get('/mobile/summary')
      .set('authorization', 'Bearer mobile-secret')

    const accountsResponse = await request(app.server)
      .get('/mobile/accounts-payable/day-fifteen')
      .set('authorization', 'Bearer mobile-secret')

    const installmentsResponse = await request(app.server)
      .get('/mobile/installments/remaining')
      .set('authorization', 'Bearer mobile-secret')

    expect(summaryResponse.status).toBe(200)
    expect(summaryResponse.body).toEqual({
      balance: 500,
      income: 2500,
      expense: 2000,
      recentTransactions: [],
    })

    expect(accountsResponse.status).toBe(200)
    expect(accountsResponse.body).toEqual({
      accountsPayableMonth: [{ description: 'Aluguel', amount: 1200 }],
      totalAmountForPayByDayFifteen: 1200,
    })

    expect(installmentsResponse.status).toBe(200)
    expect(installmentsResponse.body).toEqual({
      installments: [
        {
          expenseDescription: 'TV',
          remainingCount: 2,
          installmentValue: 300,
          totalRemaining: 600,
        },
      ],
      totalOverallRemaining: 600,
    })
    expect(getHomeDataExecute).toHaveBeenCalledTimes(1)
    expect(accountsToPayByDayFifteenExecute).toHaveBeenCalledTimes(1)
    expect(getAllRemainingInstallmentsExecute).toHaveBeenCalledTimes(1)
  })
})
