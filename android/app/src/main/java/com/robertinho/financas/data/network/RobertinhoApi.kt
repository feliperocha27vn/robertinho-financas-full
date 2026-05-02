package com.robertinho.financas.data.network

import com.robertinho.financas.data.model.*
import retrofit2.http.*

interface RobertinhoApi {

    @GET("health")
    suspend fun health(): Map<String, String>

    @GET("summary/home")
    suspend fun getHomeData(): HomeData

    @GET("expenses/payable/day-fifteen")
    suspend fun getAccountsPayableByDayFifteen(): AccountsPayableByDayFifteen

    @GET("installments/remaining/all")
    suspend fun getAllRemainingInstallments(): AllRemainingInstallments

    @GET("expenses")
    suspend fun getExpenses(): ExpensesListResponse

    @GET("expenses/unpaid")
    suspend fun getUnpaidExpenses(): UnpaidExpensesResponse

    @POST("expenses")
    suspend fun createExpense(@Body request: CreateExpenseRequest): Map<String, Any>

    @POST("expenses/pay")
    suspend fun payExpenses(@Body request: Map<String, List<String>>): Map<String, Any>

    @POST("expenses/unpay")
    suspend fun unpayExpense(@Body request: Map<String, String>): Map<String, Any>

    @POST("installments/pay")
    suspend fun payInstallment(@Body request: PayInstallmentRequest): PayInstallmentResponse

    @PATCH("expenses/pay-all-unpaid")
    suspend fun payAllUnpaid(): Map<String, Any>

    @DELETE("expenses/variables")
    suspend fun deleteAllVariableExpenses(): Map<String, Any>

    @GET("recipes")
    suspend fun getRecipes(): RecipesListResponse

    @POST("recipes")
    suspend fun createRecipe(@Body request: CreateRecipeRequest): Map<String, Any>

    @DELETE("recipes/{id}")
    suspend fun deleteRecipe(@Path("id") id: String)

    @GET("shopping-list")
    suspend fun getShoppingList(): ShoppingListResponse

    @POST("shopping-list")
    suspend fun addShoppingItem(@Body request: CreateShoppingItemRequest): AddShoppingItemResponse

    @DELETE("shopping-list")
    suspend fun clearShoppingList(): ClearShoppingListResponse
}
