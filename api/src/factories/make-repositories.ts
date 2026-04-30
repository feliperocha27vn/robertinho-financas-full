import { PrismaExpensesRepository } from '../repositories/adapters/prisma/prisma-expenses-repository'
import { PrismaInstallmentsRepository } from '../repositories/adapters/prisma/prisma-installments-repository'
import { PrismaRecipesRepository } from '../repositories/adapters/prisma/prisma-recipes-repository'
import { PrismaShoppingListRepository } from '../repositories/adapters/prisma/prisma-shopping-list-repository'

export const repositories = {
  expenses: new PrismaExpensesRepository(),
  installments: new PrismaInstallmentsRepository(),
  recipes: new PrismaRecipesRepository(),
  shoppingList: new PrismaShoppingListRepository(),
}
