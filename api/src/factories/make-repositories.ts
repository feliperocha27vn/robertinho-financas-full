import { PrismaExpensesRepository } from '../repositories/prisma/prisma-expenses-repository'
import { PrismaInstallmentsRepository } from '../repositories/prisma/prisma-installments-repository'
import { PrismaRecipesRepository } from '../repositories/prisma/prisma-recipes-repository'
import { PrismaShoppingListRepository } from '../repositories/prisma/prisma-shopping-list-repository'

export const repositories = {
  expenses: new PrismaExpensesRepository(),
  installments: new PrismaInstallmentsRepository(),
  recipes: new PrismaRecipesRepository(),
  shoppingList: new PrismaShoppingListRepository(),
}
