import type { Decimal } from "@prisma/client/runtime/library"
import { prisma } from "../../lib/prisma"

interface ExpenseItem {
    description: string
    amount: Decimal
    numberOfInstallments: number | null
}

interface GetSumExpensesReply {
    totalExpenses: string 
    items: ExpenseItem[]
}

export async function getSumExpenses(): Promise<GetSumExpensesReply> {
    const expensesList = await prisma.expenses.findMany({
        select: {
            description: true,
            amount: true,
            numberOfInstallments: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const { _sum } = await prisma.expenses.aggregate({
        _sum: {
            amount: true,
        }
    })

    const totalExpenses = _sum.amount || 0

    return {
        totalExpenses: totalExpenses.toString(),
        items: expensesList
    }
}