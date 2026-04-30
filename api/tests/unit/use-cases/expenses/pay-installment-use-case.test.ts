import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/in-memory/in-memory-installments-repository'
import { PayInstallmentUseCase } from '../../../../src/use-cases/expenses/pay-installment-use-case'

describe('PayInstallmentUseCase', () => {
  it('marks next unpaid installment as paid', async () => {
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
        dueDate: new Date('2026-03-10T00:00:00.000Z'),
        isPaid: false,
        valueInstallmentOfExpense: 1000,
      },
      {
        expensesId: expense.id,
        dueDate: new Date('2026-04-10T00:00:00.000Z'),
        isPaid: false,
        valueInstallmentOfExpense: 1000,
      },
    ])

    const sut = new PayInstallmentUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute({ nameExpense: 'Notebook' })

    expect(result).toEqual({ found: true, success: true })
    expect(installmentsRepository.items[0].isPaid).toBe(true)
  })
})
