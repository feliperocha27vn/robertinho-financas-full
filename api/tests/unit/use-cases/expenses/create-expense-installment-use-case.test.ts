import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/repositories/in-memory/in-memory-installments-repository'
import { CreateExpenseInstallmentUseCase } from '../../../../src/use-cases/expenses/create-expense-installment-use-case'

describe('CreateExpenseInstallmentUseCase', () => {
  it('creates installment expense and all installments', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )
    const sut = new CreateExpenseInstallmentUseCase(expensesRepository)

    await sut.execute({
      description: 'Celular',
      amount: 2400,
      category: 'CREDIT',
      numberOfInstallments: 12,
      firstDueDate: new Date('2026-04-10T00:00:00.000Z'),
    })

    expect(expensesRepository.items).toHaveLength(1)
    expect(installmentsRepository.items).toHaveLength(12)
    expect(installmentsRepository.items[0].valueInstallmentOfExpense).toBe(200)
  })
})
