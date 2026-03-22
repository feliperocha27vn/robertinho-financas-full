import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { GetSumExpensesUseCase } from '../../../../src/use-cases/expenses/get-sum-expenses-use-case'

describe('GetSumExpensesUseCase', () => {
  it('returns total and list of expenses', async () => {
    const expensesRepository = new InMemoryExpensesRepository()
    await expensesRepository.create({
      description: 'Uber',
      amount: 50,
      category: 'TRANSPORT',
    })
    await expensesRepository.create({
      description: 'Aluguel',
      amount: 1000,
      category: 'RESIDENCE',
    })

    const sut = new GetSumExpensesUseCase(expensesRepository)
    const result = await sut.execute()

    expect(result.totalExpenses).toBe('1050')
    expect(result.items).toHaveLength(2)
  })
})
