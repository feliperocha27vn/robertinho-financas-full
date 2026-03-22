import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { app } from '../../../src/app'
import { resetContainer, setContainer } from '../../../src/container'

describe('GET /summary/home', () => {
  afterEach(async () => {
    resetContainer()
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
          .mockResolvedValue({ totalAmountForPayByDayFifteen: 0 }),
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
