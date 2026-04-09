import request from 'supertest'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from '../../../src/app'
import { resetContainer, setContainer } from '../../../src/container'

describe('Mobile auth middleware', () => {
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

  it('returns 401 when authorization header is missing', async () => {
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

    const response = await request(app.server).get('/mobile/summary')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'Nao autorizado.',
    })
  })

  it('returns 200 when token is valid', async () => {
    setContainer({
      processMessage: {
        execute: vi.fn().mockResolvedValue({ message: 'ok' }),
      },
      getHomeData: {
        execute: vi.fn().mockResolvedValue({
          balance: 100,
          income: 400,
          expense: 300,
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

    const response = await request(app.server)
      .get('/mobile/summary')
      .set('authorization', 'Bearer mobile-secret')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      balance: 100,
      income: 400,
      expense: 300,
      recentTransactions: [],
    })
  })
})
