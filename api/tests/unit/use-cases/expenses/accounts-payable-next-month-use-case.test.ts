import { addMonths, startOfMonth } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/repositories/in-memory/in-memory-installments-repository'
import { AccountsPayableNextMonthUseCase } from '../../../../src/use-cases/expenses/accounts-payable-next-month-use-case'

describe('AccountsPayableNextMonthUseCase', () => {
  it('returns fixed and unpaid installments due next month', async () => {
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
      dueDate: startOfMonth(addMonths(new Date(), 1)),
      isPaid: false,
      valueInstallmentOfExpense: 100,
    })

    const sut = new AccountsPayableNextMonthUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute()

    expect(result.totalAmountForPayableNextMonth).toBe(200)
    expect(result.accountsPayableNextMonth).toHaveLength(2)
  })
})
