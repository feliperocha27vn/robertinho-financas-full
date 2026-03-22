import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { GetSumExpensesOfMonthVariablesUseCase } from '../../../../src/use-cases/expenses/get-sum-expenses-of-month-variables-use-case'

describe('GetSumExpensesOfMonthVariablesUseCase', () => {
  it('returns current month variable one-off sum', async () => {
    const expensesRepository = new InMemoryExpensesRepository()

    await expensesRepository.create({
      description: 'Uber',
      amount: 50,
      category: 'TRANSPORT',
      isFixed: false,
    })

    const sut = new GetSumExpensesOfMonthVariablesUseCase(expensesRepository)
    const result = await sut.execute()

    expect(result.totalExpensesOfMonth).toBe(50)
  })
})
