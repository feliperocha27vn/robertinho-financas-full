package com.robertinho.financas.data.network

import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.model.SummaryDto
import retrofit2.http.GET

interface MobileDashboardApi {
    @GET("/mobile/overview")
    suspend fun getOverview(): OverviewDto

    @GET("/mobile/summary")
    suspend fun getSummary(): SummaryDto

    @GET("/mobile/accounts-payable/day-fifteen")
    suspend fun getDayFifteen(): DayFifteenDto

    @GET("/mobile/installments/remaining")
    suspend fun getInstallments(): InstallmentsDto
}
