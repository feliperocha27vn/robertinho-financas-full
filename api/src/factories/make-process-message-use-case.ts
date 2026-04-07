import { GeminiAiProvider } from '../providers/ai/gemini-ai-provider'
import { ProcessMessageUseCase } from '../use-cases/conversation/process-message-use-case'
import { repositories } from './make-repositories'
import { useCases } from './make-use-cases'

export function makeProcessMessageUseCase() {
  const aiProvider = new GeminiAiProvider()

  return new ProcessMessageUseCase(
    repositories.session,
    aiProvider,
    repositories.calendar,
    useCases.createExpense,
    useCases.createExpenseInstallment,
    useCases.createRecipe,
    useCases.getSumExpenses,
    useCases.getSumExpensesFixed,
    useCases.getRemainingInstallments,
    useCases.getAllRemainingInstallments,
    useCases.getSumExpensesOfLastMonthVariables,
    useCases.getUnpaidExpensesOfCurrentMonth,
    useCases.payInstallment,
    useCases.payAllUnpaidCurrentMonth,
    useCases.unpayExpense,
    useCases.accountsToPayByDayFifteen,
    useCases.getHomeData,
    useCases.deleteVariableExpenseByName,
    useCases.deleteAllVariableExpensesCurrentMonth,
    useCases.getSumExpensesOfMonthVariables,
    useCases.accountsPayableNextMonth,
    useCases.payExpensesByNames,
    useCases.updateExpenseAmount,
    useCases.addShoppingListItem,
    useCases.getShoppingList,
    useCases.clearShoppingList
  )
}
