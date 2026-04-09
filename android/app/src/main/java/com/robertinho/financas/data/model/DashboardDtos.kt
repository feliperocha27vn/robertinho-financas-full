package com.robertinho.financas.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OverviewDto(
    @SerialName("title") val title: String,
    @SerialName("total_balance") val totalBalance: Double,
    @SerialName("income") val income: Double,
    @SerialName("expenses") val expenses: Double
)

@Serializable
data class SummaryDto(
    @SerialName("period") val period: String,
    @SerialName("category_totals") val categoryTotals: List<SummaryCategoryDto>
)

@Serializable
data class SummaryCategoryDto(
    @SerialName("name") val name: String,
    @SerialName("amount") val amount: Double
)

@Serializable
data class DayFifteenDto(
    @SerialName("due_count") val dueCount: Int,
    @SerialName("due_amount") val dueAmount: Double,
    @SerialName("remaining_days") val remainingDays: Int
)

@Serializable
data class InstallmentsDto(
    @SerialName("items") val items: List<InstallmentItemDto>
)

@Serializable
data class InstallmentItemDto(
    @SerialName("label") val label: String,
    @SerialName("amount") val amount: Double,
    @SerialName("remaining_installments") val remainingInstallments: Int
)
