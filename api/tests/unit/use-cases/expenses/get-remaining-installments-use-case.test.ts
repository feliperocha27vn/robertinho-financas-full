import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/in-memory/in-memory-installments-repository'
import { GetRemainingInstallmentsUseCase } from '../../../../src/use-cases/expenses/get-remaining-installments-use-case'

describe('GetRemainingInstallmentsUseCase', () => {
  it('returns remaining installments count and value', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )
    const expense = await expensesRepository.create({
      description: 'Notebook',
      amount: 3000,
      category: 'CREDIT',
      numberOfInstallments: 3,
    })

    installmentsRepository.setExpenseDescription(
      expense.id,
      expense.description
    )
    await installmentsRepository.createMany([
      {
        expensesId: expense.id,
        dueDate: new Date(),
        isPaid: false,
        valueInstallmentOfExpense: 1000,
      },
      {
        expensesId: expense.id,
        dueDate: new Date(),
        isPaid: false,
        valueInstallmentOfExpense: 1000,
      },
    ])

    const sut = new GetRemainingInstallmentsUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute({ nameExpense: 'Notebook' })

    expect(result.remainingInstallments).toBe(2)
    expect(result.totalRemaining).toBe(2000)
  })
})
