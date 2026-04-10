package com.robertinho.financas.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OverviewDto(
    @SerialName("summary") val summary: OverviewSummaryDto,
    @SerialName("accountsPayableByDayFifteen") val accountsPayableByDayFifteen: AccountsPayableByDayFifteenDto,
    @SerialName("remainingInstallments") val remainingInstallments: RemainingInstallmentsDto
)

@Serializable
data class OverviewSummaryDto(
    @SerialName("balance") val balance: Double,
    @SerialName("income") val income: Double,
    @SerialName("expense") val expense: Double,
    @SerialName("recentTransactions") val recentTransactions: List<TransactionDto>
)

@Serializable
data class SummaryDto(
    @SerialName("balance") val balance: Double,
    @SerialName("income") val income: Double,
    @SerialName("expense") val expense: Double,
    @SerialName("recentTransactions") val recentTransactions: List<TransactionDto>
)

@Serializable
data class TransactionDto(
    @SerialName("id") val id: String,
    @SerialName("description") val description: String,
    @SerialName("amount") val amount: Double,
    @SerialName("category") val category: String,
    @SerialName("date") val date: String
)

@Serializable
data class AccountsPayableByDayFifteenDto(
    @SerialName("accountsPayableMonth") val accountsPayableMonth: List<AccountPayableItemDto>,
    @SerialName("totalAmountForPayByDayFifteen") val totalAmountForPayByDayFifteen: Double
)

@Serializable
data class AccountPayableItemDto(
    @SerialName("description") val description: String,
    @SerialName("amount") val amount: Double
)

@Serializable
data class DayFifteenDto(
    @SerialName("accountsPayableMonth") val accountsPayableMonth: List<AccountPayableItemDto>,
    @SerialName("totalAmountForPayByDayFifteen") val totalAmountForPayByDayFifteen: Double
)

@Serializable
data class InstallmentsDto(
    @SerialName("installments") val installments: List<InstallmentItemDto>,
    @SerialName("totalOverallRemaining") val totalOverallRemaining: Double
)

@Serializable
data class RemainingInstallmentsDto(
    @SerialName("installments") val installments: List<InstallmentItemDto>,
    @SerialName("totalOverallRemaining") val totalOverallRemaining: Double
)

@Serializable
data class InstallmentItemDto(
    @SerialName("expenseDescription") val expenseDescription: String,
    @SerialName("installmentValue") val installmentValue: Double,
    @SerialName("remainingCount") val remainingCount: Int,
    @SerialName("totalRemaining") val totalRemaining: Double
)
