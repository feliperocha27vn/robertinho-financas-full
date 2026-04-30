import { describe, expect, it } from 'vitest'
import { InMemoryInstallmentsRepository } from '../../../../src/in-memory/in-memory-installments-repository'
import { GetAllRemainingInstallmentsUseCase } from '../../../../src/use-cases/expenses/get-all-remaining-installments-use-case'

describe('GetAllRemainingInstallmentsUseCase', () => {
  it('groups unpaid installments by expense', async () => {
    const installmentsRepository = new InMemoryInstallmentsRepository()
    installmentsRepository.setExpenseDescription('expense-1', 'Celular')

    await installmentsRepository.createMany([
      {
        expensesId: 'expense-1',
        dueDate: new Date(),
        isPaid: false,
        valueInstallmentOfExpense: 100,
      },
      {
        expensesId: 'expense-1',
        dueDate: new Date(),
        isPaid: false,
        valueInstallmentOfExpense: 100,
      },
    ])

    const sut = new GetAllRemainingInstallmentsUseCase(installmentsRepository)
    const result = await sut.execute()

    expect(result.installments).toHaveLength(1)
    expect(result.installments[0].remainingCount).toBe(2)
    expect(result.totalOverallRemaining).toBe(200)
  })
})
