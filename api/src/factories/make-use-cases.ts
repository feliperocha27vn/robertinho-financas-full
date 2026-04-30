import { AccountsPayableNextMonthUseCase } from '../use-cases/expenses/accounts-payable-next-month-use-case'
import { AccountsToPayByDayFifteenUseCase } from '../use-cases/expenses/accounts-to-pay-by-day-fifteen-use-case'
import { CreateExpenseInstallmentUseCase } from '../use-cases/expenses/create-expense-installment-use-case'
import { CreateExpenseUseCase } from '../use-cases/expenses/create-expense-use-case'
import { DeleteAllVariableExpensesCurrentMonthUseCase } from '../use-cases/expenses/delete-all-variable-expenses-current-month-use-case'
import { DeleteVariableExpenseByNameUseCase } from '../use-cases/expenses/delete-variable-expense-by-name-use-case'
import { GetAllRemainingInstallmentsUseCase } from '../use-cases/expenses/get-all-remaining-installments-use-case'
import { GetRemainingInstallmentsUseCase } from '../use-cases/expenses/get-remaining-installments-use-case'
import { GetSumExpensesFixedUseCase } from '../use-cases/expenses/get-sum-expenses-fixed-use-case'
import { GetSumExpensesOfLastMonthVariablesUseCase } from '../use-cases/expenses/get-sum-expenses-of-last-month-variables-use-case'
import { GetSumExpensesOfMonthVariablesUseCase } from '../use-cases/expenses/get-sum-expenses-of-month-variables-use-case'
import { GetSumExpensesUseCase } from '../use-cases/expenses/get-sum-expenses-use-case'
import { GetUnpaidExpensesOfCurrentMonthUseCase } from '../use-cases/expenses/get-unpaid-expenses-of-current-month-use-case'
import { PayAllUnpaidCurrentMonthUseCase } from '../use-cases/expenses/pay-all-unpaid-current-month-use-case'
import { PayExpensesByNamesUseCase } from '../use-cases/expenses/pay-expenses-by-names-use-case'
import { PayInstallmentUseCase } from '../use-cases/expenses/pay-installment-use-case'
import { UnpayExpenseUseCase } from '../use-cases/expenses/unpay-expense-use-case'
import { UpdateExpenseAmountUseCase } from '../use-cases/expenses/update-expense-amount-use-case'
import { CreateRecipeUseCase } from '../use-cases/recipes/create-recipe-use-case'
import { AddShoppingListItemUseCase } from '../use-cases/shopping-list/add-shopping-list-item-use-case'
import { ClearShoppingListUseCase } from '../use-cases/shopping-list/clear-shopping-list-use-case'
import { GetShoppingListUseCase } from '../use-cases/shopping-list/get-shopping-list-use-case'
import { GetHomeDataUseCase } from '../use-cases/summary/get-home-data-use-case'
import { repositories } from './make-repositories'

export const useCases = {
  createExpense: new CreateExpenseUseCase(repositories.expenses),
  createExpenseInstallment: new CreateExpenseInstallmentUseCase(
    repositories.expenses
  ),
  createRecipe: new CreateRecipeUseCase(repositories.recipes),
  getSumExpenses: new GetSumExpensesUseCase(repositories.expenses),
  getSumExpensesFixed: new GetSumExpensesFixedUseCase(repositories.expenses),
  getSumExpensesOfMonthVariables: new GetSumExpensesOfMonthVariablesUseCase(
    repositories.expenses
  ),
  getSumExpensesOfLastMonthVariables:
    new GetSumExpensesOfLastMonthVariablesUseCase(repositories.expenses),
  accountsPayableNextMonth: new AccountsPayableNextMonthUseCase(
    repositories.expenses,
    repositories.installments
  ),
  getUnpaidExpensesOfCurrentMonth: new GetUnpaidExpensesOfCurrentMonthUseCase(
    repositories.expenses,
    repositories.installments
  ),
  getRemainingInstallments: new GetRemainingInstallmentsUseCase(
    repositories.expenses,
    repositories.installments
  ),
  getAllRemainingInstallments: new GetAllRemainingInstallmentsUseCase(
    repositories.installments
  ),
  payInstallment: new PayInstallmentUseCase(
    repositories.expenses,
    repositories.installments
  ),
  payExpensesByNames: new PayExpensesByNamesUseCase(
    repositories.expenses,
    repositories.installments
  ),
  payAllUnpaidCurrentMonth: new PayAllUnpaidCurrentMonthUseCase(
    repositories.expenses,
    repositories.installments
  ),
  unpayExpense: new UnpayExpenseUseCase(
    repositories.expenses,
    repositories.installments
  ),
  updateExpenseAmount: new UpdateExpenseAmountUseCase(
    repositories.expenses,
    repositories.installments
  ),
  accountsToPayByDayFifteen: new AccountsToPayByDayFifteenUseCase(
    repositories.expenses,
    repositories.installments
  ),
  getHomeData: new GetHomeDataUseCase(
    repositories.expenses,
    repositories.installments,
    repositories.recipes
  ),
  deleteVariableExpenseByName: new DeleteVariableExpenseByNameUseCase(
    repositories.expenses
  ),
  deleteAllVariableExpensesCurrentMonth:
    new DeleteAllVariableExpensesCurrentMonthUseCase(repositories.expenses),
  addShoppingListItem: new AddShoppingListItemUseCase(
    repositories.shoppingList
  ),
  getShoppingList: new GetShoppingListUseCase(repositories.shoppingList),
  clearShoppingList: new ClearShoppingListUseCase(repositories.shoppingList),
}
