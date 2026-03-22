import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { GetSumExpensesFixedUseCase } from '../../../../src/use-cases/expenses/get-sum-expenses-fixed-use-case'

describe('GetSumExpensesFixedUseCase', () => {
  it('returns total and fixed items only', async () => {
    const expensesRepository = new InMemoryExpensesRepository()
    await expensesRepository.create({
      description: 'Aluguel',
      amount: 1000,
      category: 'RESIDENCE',
      isFixed: true,
    })
    await expensesRepository.create({
      description: 'Uber',
      amount: 50,
      category: 'TRANSPORT',
      isFixed: false,
    })

    const sut = new GetSumExpensesFixedUseCase(expensesRepository)
    const result = await sut.execute()

    expect(result.totalFixedExpenses).toBe('1000')
    expect(result.items).toHaveLength(1)
  })
})
