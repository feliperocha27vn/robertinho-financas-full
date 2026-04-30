import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { CreateExpenseUseCase } from '../../../../src/use-cases/expenses/create-expense-use-case'

describe('CreateExpenseUseCase', () => {
  it('creates an expense', async () => {
    const expensesRepository = new InMemoryExpensesRepository()
    const sut = new CreateExpenseUseCase(expensesRepository)

    const result = await sut.execute({
      description: 'Uber',
      amount: 50,
      category: 'TRANSPORT',
      isFixed: false,
    })

    expect(expensesRepository.items).toHaveLength(1)
    expect(expensesRepository.items[0]).toEqual(
      expect.objectContaining({
        description: 'Uber',
        amount: 50,
        category: 'TRANSPORT',
      })
    )
    expect(result.expense.description).toBe('Uber')
    expect(result.expense.amount).toBe(50)
    expect(result.expense.category).toBe('TRANSPORT')
  })
})
