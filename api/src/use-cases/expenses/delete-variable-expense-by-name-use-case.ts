import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'

interface Input {
  nameExpense: string
  selectedExpenseId?: string
}

type Result =
  | { status: 'not_found' }
  | {
      status: 'ambiguous'
      options: Array<{ id: string; description: string; amount: number }>
    }
  | {
      status: 'success'
      deleted: { id: string; description: string; amount: number }
    }

export class DeleteVariableExpenseByNameUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(input: Input): Promise<Result> {
    const matches =
      await this.expensesRepository.findVariableOneOffCurrentMonthByDescriptionContains(
        input.nameExpense
      )

    if (matches.length === 0) {
      return { status: 'not_found' }
    }

    if (input.selectedExpenseId) {
      const selected = matches.find(item => item.id === input.selectedExpenseId)
      if (!selected) {
        return {
          status: 'ambiguous',
          options: matches.map(item => ({
            id: item.id,
            description: item.description,
            amount: item.amount,
          })),
        }
      }

      await this.expensesRepository.deleteById(selected.id)
      return {
        status: 'success',
        deleted: {
          id: selected.id,
          description: selected.description,
          amount: selected.amount,
        },
      }
    }

    if (matches.length > 1) {
      return {
        status: 'ambiguous',
        options: matches.map(item => ({
          id: item.id,
          description: item.description,
          amount: item.amount,
        })),
      }
    }

    const selected = matches[0]
    await this.expensesRepository.deleteById(selected.id)

    return {
      status: 'success',
      deleted: {
        id: selected.id,
        description: selected.description,
        amount: selected.amount,
      },
    }
  }
}
