import { endOfMonth, startOfMonth } from 'date-fns'
import type { ExpensesRepository } from '../../repositories/contracts/expenses-repository'
import type { InstallmentsRepository } from '../../repositories/contracts/installments-repository'

interface Input {
  items: string[]
}

type Candidate =
  | {
      type: 'fixed'
      id: string
      description: string
      amount: number
    }
  | {
      type: 'installment'
      id: string
      expensesId: string
      description: string
      amount: number
    }

type Result =
  | {
      status: 'paid'
      paidDescriptions: string[]
      notFound: string[]
    }
  | {
      status: 'ambiguous'
      term: string
      options: string[]
    }

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export class PayExpensesByNamesUseCase {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly installmentsRepository: InstallmentsRepository
  ) {}

  async execute(input: Input): Promise<Result> {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const [fixedExpenses, unpaidInstallments] = await Promise.all([
      this.expensesRepository.findAllFixedForStatus(),
      this.installmentsRepository.findUnpaidInRangeWithDescription(
        monthStart,
        monthEnd
      ),
    ])

    const paidFixedIds =
      await this.installmentsRepository.findPaidFixedExpenseIdsInMonth(
        fixedExpenses.map(item => item.id),
        now
      )

    const unpaidFixedCandidates: Candidate[] = fixedExpenses
      .filter(item => !paidFixedIds.includes(item.id))
      .map(item => ({
        type: 'fixed',
        id: item.id,
        description: item.description,
        amount: item.amount,
      }))

    const unpaidInstallmentCandidates: Candidate[] = unpaidInstallments.map(
      item => ({
        type: 'installment',
        id: item.id,
        expensesId: item.expensesId,
        description: item.expenseDescription,
        amount: item.valueInstallmentOfExpense,
      })
    )

    const candidates = [
      ...unpaidFixedCandidates,
      ...unpaidInstallmentCandidates,
    ]
    const selectedCandidates = new Map<string, Candidate>()
    const notFound: string[] = []

    for (const rawTerm of input.items) {
      const term = normalize(rawTerm)
      if (!term) {
        continue
      }

      const matched = candidates.filter(candidate =>
        normalize(candidate.description).includes(term)
      )

      const uniqueOptions = Array.from(
        new Set(matched.map(item => item.description))
      )
      if (uniqueOptions.length > 1) {
        return {
          status: 'ambiguous',
          term: rawTerm,
          options: uniqueOptions,
        }
      }

      if (matched.length === 0) {
        notFound.push(rawTerm)
        continue
      }

      const candidate = matched[0]
      const key =
        candidate.type === 'fixed'
          ? `fixed:${candidate.id}`
          : `inst:${candidate.id}`
      selectedCandidates.set(key, candidate)
    }

    const fixedToPay = Array.from(selectedCandidates.values()).filter(
      (candidate): candidate is Extract<Candidate, { type: 'fixed' }> =>
        candidate.type === 'fixed'
    )
    const installmentsToPay = Array.from(selectedCandidates.values()).filter(
      (candidate): candidate is Extract<Candidate, { type: 'installment' }> =>
        candidate.type === 'installment'
    )

    if (fixedToPay.length > 0) {
      await this.installmentsRepository.createMany(
        fixedToPay.map(item => ({
          expensesId: item.id,
          dueDate: now,
          isPaid: true,
          valueInstallmentOfExpense: item.amount,
        }))
      )
    }

    if (installmentsToPay.length > 0) {
      await this.installmentsRepository.markManyPaid(
        installmentsToPay.map(item => item.id)
      )
    }

    const paidDescriptions = Array.from(
      new Set(
        Array.from(selectedCandidates.values()).map(item => item.description)
      )
    )

    return {
      status: 'paid',
      paidDescriptions,
      notFound,
    }
  }
}
