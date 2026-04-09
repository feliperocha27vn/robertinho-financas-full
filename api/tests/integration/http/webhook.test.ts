import request from 'supertest'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { app } from '../../../src/app'
import { resetContainer, setContainer } from '../../../src/container'

describe('POST /webhook', () => {
  afterEach(async () => {
    resetContainer()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns processed assistant message', async () => {
    setContainer({
      processMessage: {
        execute: vi.fn().mockResolvedValue({ message: 'resposta simulada' }),
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

    const response = await request(app.server)
      .post('/webhook')
      .send({ text: 'oi', phone: 'telegram-1' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'resposta simulada',
    })
  })
})
