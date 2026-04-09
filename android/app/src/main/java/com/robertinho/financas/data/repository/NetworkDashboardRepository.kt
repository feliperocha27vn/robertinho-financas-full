package com.robertinho.financas.data.repository

import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.model.SummaryDto
import com.robertinho.financas.data.network.MobileDashboardApi

class NetworkDashboardRepository(
    private val api: MobileDashboardApi
) : DashboardRepository {
    override suspend fun getOverview(): OverviewDto = api.getOverview()

    override suspend fun getSummary(): SummaryDto = api.getSummary()

    override suspend fun getDayFifteen(): DayFifteenDto = api.getDayFifteen()

    override suspend fun getInstallments(): InstallmentsDto = api.getInstallments()
}
