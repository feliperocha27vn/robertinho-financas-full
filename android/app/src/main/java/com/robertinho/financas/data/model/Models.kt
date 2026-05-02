package com.robertinho.financas.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class HomeData(
    val balance: Double,
    val income: Double,
    val expense: Double,
    val recentTransactions: List<TransactionItem> = emptyList()
)

@Serializable
data class TransactionItem(
    val id: String,
    val description: String,
    val amount: Double,
    val category: String,
    val date: String
)

@Serializable
data class AccountsPayableByDayFifteen(
    val totalAmountForPayByDayFifteen: Double,
    val accountsPayableMonth: List<AccountPayableItem> = emptyList()
)

@Serializable
data class AccountPayableItem(
    val description: String,
    val amount: Double
)

@Serializable
data class AllRemainingInstallments(
    val installments: List<InstallmentGroup> = emptyList(),
    val totalOverallRemaining: Double
)

@Serializable
data class InstallmentGroup(
    val expenseDescription: String,
    val remainingCount: Int,
    val installmentValue: Double,
    val totalRemaining: Double
)

@Serializable
data class Expense(
    val id: String = "",
    val description: String,
    val amount: Double,
    val category: String,
    @SerialName("isFixed")
    val isFixed: Boolean,
    val numberOfInstallments: Int? = null,
    val createdAt: String = ""
)

@Serializable
data class ExpensesListResponse(
    val items: List<Expense> = emptyList(),
    val nextCursor: String? = null
)

@Serializable
data class UnpaidExpensesResponse(
    val unpaidExpenses: List<AccountPayableItem> = emptyList(),
    val totalUnpaidAmount: Double
)

@Serializable
data class Recipe(
    val id: String = "",
    val description: String,
    val amount: Double,
    val createdAt: String = ""
)

@Serializable
data class RecipesListResponse(
    val recipes: List<Recipe> = emptyList()
)

@Serializable
data class ShoppingListItem(
    val id: String = "",
    val name: String,
    val createdAt: String = ""
)

@Serializable
data class ShoppingListResponse(
    val items: List<ShoppingListItem> = emptyList()
)

@Serializable
data class CreateExpenseRequest(
    val description: String,
    val amount: Double,
    val category: String,
    val isFixed: Boolean = false,
    val numberOfInstallments: Int? = null
)

@Serializable
data class CreateRecipeRequest(
    val description: String,
    val amount: Double
)

@Serializable
data class CreateShoppingItemRequest(
    val name: String
)

@Serializable
data class PayInstallmentRequest(
    val nameExpense: String
)

@Serializable
data class PayInstallmentResponse(
    val found: Boolean,
    val success: Boolean? = null
)

@Serializable
data class ClearShoppingListResponse(
    val cleared: Int
)

@Serializable
data class AddShoppingItemResponse(
    val status: String,
    val item: ShoppingListItem
)
