import { addDays, startOfMonth } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/in-memory/in-memory-installments-repository'
import { AccountsToPayByDayFifteenUseCase } from '../../../../src/use-cases/expenses/accounts-to-pay-by-day-fifteen-use-case'

describe('AccountsToPayByDayFifteenUseCase', () => {
  it('returns total amount for fixed and installments due in window', async () => {
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
      description: 'Notebook',
      amount: 3000,
      category: 'CREDIT',
      numberOfInstallments: 3,
    })

    installmentsRepository.setExpenseDescription(fixed.id, fixed.description)
    installmentsRepository.setExpenseDescription(
      installmentExpense.id,
      installmentExpense.description
    )
    await installmentsRepository.create({
      expensesId: installmentExpense.id,
      dueDate: addDays(startOfMonth(new Date()), 5),
      isPaid: false,
      valueInstallmentOfExpense: 1000,
    })

    const sut = new AccountsToPayByDayFifteenUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute()

    expect(result.totalAmountForPayByDayFifteen).toBe(1100)
  })
})
