export const transactionTypes = [
  'TRANSPORT',
  'OTHERS',
  'STUDIES',
  'RESIDENCE',
  'CREDIT',
] as const

export type TransactionType = (typeof transactionTypes)[number]

export interface ExpenseItem {
  id: string
  description: string
  amount: number
  category: TransactionType
  isFixed: boolean
  numberOfInstallments: number | null
  createdAt: Date
}

export interface InstallmentItem {
  id: string
  expensesId: string
  dueDate: Date
  isPaid: boolean
  valueInstallmentOfExpense: number
}

export interface RecipeItem {
  id: string
  description: string
  amount: number
  createdAt: Date
}

export interface ShoppingListItem {
  id: string
  userId: string
  name: string
  createdAt: Date
}
