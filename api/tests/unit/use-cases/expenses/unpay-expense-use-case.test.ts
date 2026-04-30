import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/in-memory/in-memory-installments-repository'
import { UnpayExpenseUseCase } from '../../../../src/use-cases/expenses/unpay-expense-use-case'

describe('UnpayExpenseUseCase', () => {
  it('unmarks latest paid installment', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )
    const expense = await expensesRepository.create({
      description: 'Notebook',
      amount: 3000,
      category: 'CREDIT',
    })

    installmentsRepository.setExpenseDescription(
      expense.id,
      expense.description
    )
    const installment = await installmentsRepository.create({
      expensesId: expense.id,
      dueDate: new Date(),
      isPaid: true,
      valueInstallmentOfExpense: 1000,
    })

    const sut = new UnpayExpenseUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute({ nameExpense: 'Notebook' })

    expect(result).toEqual(
      expect.objectContaining({
        found: true,
        success: true,
        expenseDescription: 'Notebook',
      })
    )

    const updated = installmentsRepository.items.find(
      item => item.id === installment.id
    )
    expect(updated?.isPaid).toBe(false)
  })
})
