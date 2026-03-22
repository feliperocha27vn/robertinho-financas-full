import { GeminiAiProvider } from '../providers/ai/gemini-ai-provider'
import { ProcessMessageUseCase } from '../use-cases/conversation/process-message-use-case'
import { repositories } from './make-repositories'
import { useCases } from './make-use-cases'

export function makeProcessMessageUseCase() {
  const aiProvider = new GeminiAiProvider()

  return new ProcessMessageUseCase(
    repositories.session,
    aiProvider,
    useCases.createExpense,
    useCases.createExpenseInstallment,
    useCases.createRecipe,
    useCases.getSumExpenses,
    useCases.getSumExpensesFixed,
    useCases.getSumExpensesOfMonthVariables,
    useCases.getSumExpensesOfLastMonthVariables,
    useCases.accountsPayableNextMonth,
    useCases.getUnpaidExpensesOfCurrentMonth,
    useCases.getRemainingInstallments,
    useCases.getAllRemainingInstallments,
    useCases.payInstallment,
    useCases.payAllUnpaidCurrentMonth,
    useCases.unpayExpense
  )
}
