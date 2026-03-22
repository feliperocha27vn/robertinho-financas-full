import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/repositories/in-memory/in-memory-installments-repository'
import { PayAllUnpaidCurrentMonthUseCase } from '../../../../src/use-cases/expenses/pay-all-unpaid-current-month-use-case'

describe('PayAllUnpaidCurrentMonthUseCase', () => {
  it('pays all pending fixed and installments in current month', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )

    const fixed = await expensesRepository.create({
      description: 'Internet',
      amount: 100,
      category: 'RESIDENCE',
      isFixed: true,
    })

    const installmentExpense = await expensesRepository.create({
      description: 'Celular',
      amount: 1200,
      category: 'CREDIT',
      numberOfInstallments: 12,
    })

    installmentsRepository.setExpenseDescription(fixed.id, fixed.description)
    installmentsRepository.setExpenseDescription(
      installmentExpense.id,
      installmentExpense.description
    )

    await installmentsRepository.create({
      expensesId: installmentExpense.id,
      dueDate: new Date(),
      isPaid: false,
      valueInstallmentOfExpense: 100,
    })

    const sut = new PayAllUnpaidCurrentMonthUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute()

    expect(result.success).toBe(true)
    expect(result.paidCount).toBeGreaterThanOrEqual(2)
  })
})
