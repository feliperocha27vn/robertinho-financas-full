import request from 'supertest'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { app } from '../../../src/app'
import { resetContainer, setContainer } from '../../../src/container'

describe('GET /summary/home', () => {
  afterEach(async () => {
    resetContainer()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns summary from use case', async () => {
    setContainer({
      processMessage: {
        execute: vi.fn().mockResolvedValue({ message: 'ok' }),
      },
      getHomeData: {
        execute: vi.fn().mockResolvedValue({
          balance: 100,
          income: 1000,
          expense: 900,
          recentTransactions: [],
        }),
      },
      accountsToPayByDayFifteen: {
        execute: vi
          .fn()
          .mockResolvedValue({
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

    const response = await request(app.server).get('/summary/home')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      balance: 100,
      income: 1000,
      expense: 900,
      recentTransactions: [],
    })
  })
})
