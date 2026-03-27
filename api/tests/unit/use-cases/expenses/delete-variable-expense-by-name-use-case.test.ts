import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { DeleteVariableExpenseByNameUseCase } from '../../../../src/use-cases/expenses/delete-variable-expense-by-name-use-case'

describe('DeleteVariableExpenseByNameUseCase', () => {
  it('returns not_found when there is no variable expense matching in current month', async () => {
    const expenses = new InMemoryExpensesRepository()
    const sut = new DeleteVariableExpenseByNameUseCase(expenses)

    const result = await sut.execute({ nameExpense: 'lanche' })

    expect(result.status).toBe('not_found')
  })

  it('returns ambiguous when multiple variable expenses match', async () => {
    const expenses = new InMemoryExpensesRepository()
    await expenses.create({
      description: 'Lanche mercado',
      amount: 32,
      category: 'OTHERS',
    })
    await expenses.create({
      description: 'Lanche padaria',
      amount: 19,
      category: 'OTHERS',
    })

    const sut = new DeleteVariableExpenseByNameUseCase(expenses)
    const result = await sut.execute({ nameExpense: 'lanche' })

    expect(result.status).toBe('ambiguous')
    if (result.status === 'ambiguous') {
      expect(result.options).toHaveLength(2)
    }
  })

  it('deletes the variable expense when there is a single match', async () => {
    const expenses = new InMemoryExpensesRepository()
    const created = await expenses.create({
      description: 'Lanche unico',
      amount: 25,
      category: 'OTHERS',
    })

    const sut = new DeleteVariableExpenseByNameUseCase(expenses)
    const result = await sut.execute({ nameExpense: 'lanche unico' })

    expect(result.status).toBe('success')
    const all = await expenses.findAll()
    expect(all.some(item => item.id === created.id)).toBe(false)
  })

  it('deletes a specific option by id when user resolves ambiguity', async () => {
    const expenses = new InMemoryExpensesRepository()
    const first = await expenses.create({
      description: 'Lanche mercado',
      amount: 32,
      category: 'OTHERS',
    })
    await expenses.create({
      description: 'Lanche padaria',
      amount: 19,
      category: 'OTHERS',
    })

    const sut = new DeleteVariableExpenseByNameUseCase(expenses)
    const result = await sut.execute({
      nameExpense: 'lanche',
      selectedExpenseId: first.id,
    })

    expect(result.status).toBe('success')
    const all = await expenses.findAll()
    expect(all.some(item => item.id === first.id)).toBe(false)
  })
})
