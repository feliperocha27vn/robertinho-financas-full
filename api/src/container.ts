import { makeProcessMessageUseCase } from './factories/make-process-message-use-case'
import { useCases } from './factories/make-use-cases'

export interface AppContainer {
  processMessage: {
    execute(input: {
      sessionId: string
      text: string
    }): Promise<{ message: string }>
  }
  getHomeData: {
    execute(): Promise<{
      balance: number
      income: number
      expense: number
      recentTransactions: {
        id: string
        description: string
        amount: number
        category: string
        date: Date
      }[]
    }>
  }
  accountsToPayByDayFifteen: {
    execute(): Promise<{
      totalAmountForPayByDayFifteen: number
    }>
  }
}

const defaultContainer: AppContainer = {
  processMessage: makeProcessMessageUseCase(),
  getHomeData: useCases.getHomeData,
  accountsToPayByDayFifteen: useCases.accountsToPayByDayFifteen,
}

let currentContainer: AppContainer = defaultContainer

export function getContainer(): AppContainer {
  return currentContainer
}

export function setContainer(container: AppContainer): void {
  currentContainer = container
}

export function resetContainer(): void {
  currentContainer = defaultContainer
}
