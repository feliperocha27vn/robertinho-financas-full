import { PrismaExpensesRepository } from '../repositories/prisma/prisma-expenses-repository'
import { PrismaInstallmentsRepository } from '../repositories/prisma/prisma-installments-repository'
import { PrismaRecipesRepository } from '../repositories/prisma/prisma-recipes-repository'
import { PrismaSessionRepository } from '../repositories/prisma/prisma-session-repository'

export const repositories = {
  expenses: new PrismaExpensesRepository(),
  installments: new PrismaInstallmentsRepository(),
  recipes: new PrismaRecipesRepository(),
  session: new PrismaSessionRepository(),
}
