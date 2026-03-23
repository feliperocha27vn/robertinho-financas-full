import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/repositories/in-memory/in-memory-installments-repository'
import { UpdateExpenseAmountUseCase } from '../../../../src/use-cases/expenses/update-expense-amount-use-case'

describe('UpdateExpenseAmountUseCase', () => {
  it('updates expense amount when exact match is unique', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )

    await expensesRepository.create({
      description: 'Energia',
      amount: 130,
      category: 'RESIDENCE',
      isFixed: true,
    })

    const sut = new UpdateExpenseAmountUseCase(
      expensesRepository,
      installmentsRepository
    )

    const result = await sut.execute({
      nameExpense: 'energia',
      amount: 110,
    })

    expect(result).toEqual(
      expect.objectContaining({
        status: 'updated',
        description: 'Energia',
        oldAmount: 130,
        newAmount: 110,
      })
    )
  })

  it('returns ambiguous when more than one description matches', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )

    await expensesRepository.create({
      description: 'Energia Casa',
      amount: 130,
      category: 'RESIDENCE',
      isFixed: true,
    })
    await expensesRepository.create({
      description: 'Energia Escritorio',
      amount: 220,
      category: 'RESIDENCE',
      isFixed: true,
    })

    const sut = new UpdateExpenseAmountUseCase(
      expensesRepository,
      installmentsRepository
    )

    const result = await sut.execute({
      nameExpense: 'energia',
      amount: 110,
    })

    expect(result.status).toBe('ambiguous')
  })
})
