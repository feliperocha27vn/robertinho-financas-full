import { describe, expect, it } from 'vitest'
import { InMemoryExpensesRepository } from '../../../../src/repositories/in-memory/in-memory-expenses-repository'
import { InMemoryInstallmentsRepository } from '../../../../src/repositories/in-memory/in-memory-installments-repository'
import { InMemoryRecipesRepository } from '../../../../src/repositories/in-memory/in-memory-recipes-repository'
import { GetHomeDataUseCase } from '../../../../src/use-cases/summary/get-home-data-use-case'

describe('GetHomeDataUseCase', () => {
  it('returns home summary with balance', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    const expensesRepository = new InMemoryExpensesRepository(
      installmentsRepository
    )
    const recipesRepository = new InMemoryRecipesRepository()

    await expensesRepository.create({
      description: 'Aluguel',
      amount: 1000,
      category: 'RESIDENCE',
      isFixed: true,
    })
    await expensesRepository.create({
      description: 'Uber',
      amount: 100,
      category: 'TRANSPORT',
      isFixed: false,
    })
    await recipesRepository.create({ description: 'Salario', amount: 3000 })

    const sut = new GetHomeDataUseCase(
      expensesRepository,
      installmentsRepository,
      recipesRepository
    )
    const result = await sut.execute()

    expect(result.income).toBe(3000)
    expect(result.expense).toBe(1100)
    expect(result.balance).toBe(1900)
  })
})
