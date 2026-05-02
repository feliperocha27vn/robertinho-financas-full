package com.robertinho.financas.data.repository

import com.robertinho.financas.data.model.*
import com.robertinho.financas.data.network.ApiClient

class DashboardRepository {
    private val api = ApiClient.api

    suspend fun getHomeData(): HomeData = api.getHomeData()

    suspend fun getAccountsPayableByDayFifteen(): AccountsPayableByDayFifteen =
        api.getAccountsPayableByDayFifteen()

    suspend fun getAllRemainingInstallments(): AllRemainingInstallments =
        api.getAllRemainingInstallments()

    suspend fun getExpenses(): List<Expense> = api.getExpenses().items

    suspend fun createExpense(request: CreateExpenseRequest) = api.createExpense(request)

    suspend fun payExpenses(names: List<String>) =
        api.payExpenses(mapOf("items" to names))

    suspend fun unpayExpense(name: String) =
        api.unpayExpense(mapOf("nameExpense" to name))

    suspend fun payInstallment(name: String) =
        api.payInstallment(PayInstallmentRequest(name))

    suspend fun payAllUnpaid() = api.payAllUnpaid()

    suspend fun deleteAllVariableExpenses() = api.deleteAllVariableExpenses()

    suspend fun getRecipes(): List<Recipe> = api.getRecipes().recipes

    suspend fun createRecipe(request: CreateRecipeRequest) = api.createRecipe(request)

    suspend fun deleteRecipe(id: String) = api.deleteRecipe(id)

    suspend fun getShoppingList(): List<ShoppingListItem> = api.getShoppingList().items

    suspend fun addShoppingItem(name: String): AddShoppingItemResponse =
        api.addShoppingItem(CreateShoppingItemRequest(name))

    suspend fun clearShoppingList(): Int = api.clearShoppingList().cleared
}
