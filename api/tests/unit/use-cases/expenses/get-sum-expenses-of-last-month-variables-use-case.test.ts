import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { GetSumExpensesOfLastMonthVariablesUseCase } from '../../../../src/use-cases/expenses/get-sum-expenses-of-last-month-variables-use-case'

describe('GetSumExpensesOfLastMonthVariablesUseCase', () => {
  it('returns last month variable one-off sum (zero when empty)', async () => {
    const expensesRepository = new InMemoryExpensesRepository()
    const sut = new GetSumExpensesOfLastMonthVariablesUseCase(
      expensesRepository
    )

    const result = await sut.execute()

    expect(result.totalExpensesOfLastMonth).toBe(0)
  })
})
