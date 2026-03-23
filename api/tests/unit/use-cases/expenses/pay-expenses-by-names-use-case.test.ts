import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/repositories/in-memory/in-memory-installments-repository'
import { PayExpensesByNamesUseCase } from '../../../../src/use-cases/expenses/pay-expenses-by-names-use-case'

describe('PayExpensesByNamesUseCase', () => {
  it('marks multiple expenses as paid using flexible name matching', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )

    const fixedExpense = await expensesRepository.create({
      description: 'Renegociacao',
      amount: 300,
      category: 'OTHERS',
      isFixed: true,
    })
    const cardExpense = await expensesRepository.create({
      description: 'Cartao Nubank',
      amount: 600,
      category: 'CREDIT',
      numberOfInstallments: 6,
    })

    installmentsRepository.setExpenseDescription(
      fixedExpense.id,
      fixedExpense.description
    )
    installmentsRepository.setExpenseDescription(
      cardExpense.id,
      cardExpense.description
    )

    await installmentsRepository.create({
      expensesId: cardExpense.id,
      dueDate: new Date(),
      isPaid: false,
      valueInstallmentOfExpense: 100,
    })

    const sut = new PayExpensesByNamesUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute({ items: ['renegociacao', 'cartao'] })

    expect(result.status).toBe('paid')
    if (result.status === 'paid') {
      expect(result.paidDescriptions).toContain('Renegociacao')
      expect(result.paidDescriptions).toContain('Cartao Nubank')
    }
  })

  it('returns ambiguous when term matches multiple open expenses', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )

    const expenseA = await expensesRepository.create({
      description: 'Cartao Nubank',
      amount: 600,
      category: 'CREDIT',
      numberOfInstallments: 6,
    })
    const expenseB = await expensesRepository.create({
      description: 'Cartao Inter',
      amount: 400,
      category: 'CREDIT',
      numberOfInstallments: 4,
    })

    installmentsRepository.setExpenseDescription(
      expenseA.id,
      expenseA.description
    )
    installmentsRepository.setExpenseDescription(
      expenseB.id,
      expenseB.description
    )

    await installmentsRepository.createMany([
      {
        expensesId: expenseA.id,
        dueDate: new Date(),
        isPaid: false,
        valueInstallmentOfExpense: 100,
      },
      {
        expensesId: expenseB.id,
        dueDate: new Date(),
        isPaid: false,
        valueInstallmentOfExpense: 100,
      },
    ])

    const sut = new PayExpensesByNamesUseCase(
      expensesRepository,
      installmentsRepository
    )
    const result = await sut.execute({ items: ['cartao'] })

    expect(result.status).toBe('ambiguous')
    if (result.status === 'ambiguous') {
      expect(result.options).toEqual(
        expect.arrayContaining(['Cartao Nubank', 'Cartao Inter'])
      )
    }
  })
})
