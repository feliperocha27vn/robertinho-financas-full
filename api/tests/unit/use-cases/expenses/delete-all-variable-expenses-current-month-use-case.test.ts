import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { DeleteAllVariableExpensesCurrentMonthUseCase } from '../../../../src/use-cases/expenses/delete-all-variable-expenses-current-month-use-case'

describe('DeleteAllVariableExpensesCurrentMonthUseCase', () => {
  it('returns preview with count and total', async () => {
    const expenses = new InMemoryExpensesRepository()
    await expenses.create({
      description: 'Lanche',
      amount: 20,
      category: 'OTHERS',
    })
    await expenses.create({
      description: 'Uber',
      amount: 30,
      category: 'TRANSPORT',
    })

    const sut = new DeleteAllVariableExpensesCurrentMonthUseCase(expenses)
    const preview = await sut.preview()

    expect(preview.count).toBe(2)
    expect(preview.total).toBe(50)
  })

  it('deletes all variable one-off expenses from current month', async () => {
    const expenses = new InMemoryExpensesRepository()
    await expenses.create({
      description: 'Lanche',
      amount: 20,
      category: 'OTHERS',
    })
    await expenses.create({
      description: 'Uber',
      amount: 30,
      category: 'TRANSPORT',
    })

    const sut = new DeleteAllVariableExpensesCurrentMonthUseCase(expenses)
    const result = await sut.execute()

    expect(result.deletedCount).toBe(2)
    expect(result.totalDeleted).toBe(50)

    const remaining = await expenses.findVariableOneOffCurrentMonth()
    expect(remaining).toHaveLength(0)
  })
})
