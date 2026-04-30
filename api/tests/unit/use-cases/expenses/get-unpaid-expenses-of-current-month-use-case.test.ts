import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/in-memory/in-memory-installments-repository'
import { GetUnpaidExpensesOfCurrentMonthUseCase } from '../../../../src/use-cases/expenses/get-unpaid-expenses-of-current-month-use-case'

describe('GetUnpaidExpensesOfCurrentMonthUseCase', () => {
  it('returns unpaid fixed and unpaid installments totals', async () => {
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

    const sut = new GetUnpaidExpensesOfCurrentMonthUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute()

    expect(result.totalUnpaidAmount).toBe(200)
    expect(result.unpaidExpenses).toHaveLength(2)
  })
})
