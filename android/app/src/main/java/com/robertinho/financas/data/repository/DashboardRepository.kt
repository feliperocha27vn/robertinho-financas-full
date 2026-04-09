package com.robertinho.financas.data.repository

import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.model.SummaryDto

interface DashboardRepository {
    suspend fun getOverview(): OverviewDto
    suspend fun getSummary(): SummaryDto
    suspend fun getDayFifteen(): DayFifteenDto
    suspend fun getInstallments(): InstallmentsDto
}
