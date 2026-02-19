import { prisma } from "../../lib/prisma"

interface GetSumExpensesReply {
    totalExpenses: string 
}

export async function getSumExpenses(): Promise<GetSumExpensesReply> {
    const { _sum } = await prisma.expenses.aggregate({
        _sum: {
            amount: true,
        }
    })

    const totalExpenses = _sum.amount || 0

    return {
        totalExpenses: totalExpenses.toString()
    }
}