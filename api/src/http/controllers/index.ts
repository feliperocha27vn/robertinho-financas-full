import type { FastifyInstance } from 'fastify'
import { accountsPayableByDayFifteenController } from './expenses/accounts-payable-by-day-fifteen-controller'
import { createExpenseController } from './expenses/create-expense-controller'
import { deleteAllVariableExpensesController } from './expenses/delete-all-variable-expenses-controller'
import { deleteVariableExpenseController } from './expenses/delete-variable-expense-controller'
import { getAccountsPayableController } from './expenses/get-accounts-payable-controller'
import { getAllRemainingInstallmentsController } from './expenses/get-all-remaining-installments-controller'
import { getRemainingInstallmentsController } from './expenses/get-remaining-installments-controller'
import { getSumExpensesController } from './expenses/get-sum-expenses-controller'
import { getSumFixedExpensesController } from './expenses/get-sum-fixed-expenses-controller'
import { getSumLastMonthVariableExpensesController } from './expenses/get-sum-last-month-variable-expenses-controller'
import { getSumVariableExpensesController } from './expenses/get-sum-variable-expenses-controller'
import { getUnpaidExpensesController } from './expenses/get-unpaid-expenses-controller'
import { payAllUnpaidController } from './expenses/pay-all-unpaid-controller'
import { payExpensesByNamesController } from './expenses/pay-expenses-by-names-controller'
import { payInstallmentController } from './expenses/pay-installment-controller'
import { unpayExpenseController } from './expenses/unpay-expense-controller'
import { updateExpenseAmountController } from './expenses/update-expense-amount-controller'
import { healthController } from './health/health-controller'
import { createRecipeController } from './recipes/create-recipe-controller'
import { deleteRecipeController } from './recipes/delete-recipe-controller'
import { fetchRecipesController } from './recipes/fetch-recipes-controller'
import { getRecipeController } from './recipes/get-recipe-controller'
import { updateRecipeController } from './recipes/update-recipe-controller'
import { addShoppingListItemController } from './shopping-list/add-item-controller'
import { clearShoppingListController } from './shopping-list/clear-items-controller'
import { fetchShoppingListController } from './shopping-list/fetch-items-controller'
import { getHomeDataController } from './summary/get-home-data-controller'

export function registerControllers(app: FastifyInstance) {
  app.register(healthController)
  app.register(getHomeDataController)
  app.register(createExpenseController)
  app.register(getSumExpensesController)
  app.register(getSumFixedExpensesController)
  app.register(getSumVariableExpensesController)
  app.register(getSumLastMonthVariableExpensesController)
  app.register(getUnpaidExpensesController)
  app.register(getAccountsPayableController)
  app.register(accountsPayableByDayFifteenController)
  app.register(getRemainingInstallmentsController)
  app.register(getAllRemainingInstallmentsController)
  app.register(payInstallmentController)
  app.register(payExpensesByNamesController)
  app.register(payAllUnpaidController)
  app.register(unpayExpenseController)
  app.register(updateExpenseAmountController)
  app.register(deleteVariableExpenseController)
  app.register(deleteAllVariableExpensesController)
  app.register(createRecipeController)
  app.register(fetchRecipesController)
  app.register(getRecipeController)
  app.register(updateRecipeController)
  app.register(deleteRecipeController)
  app.register(addShoppingListItemController)
  app.register(fetchShoppingListController)
  app.register(clearShoppingListController)
}
