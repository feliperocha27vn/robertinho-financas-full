package com.robertinho.financas.di

import com.robertinho.financas.data.repository.DashboardRepository
import com.robertinho.financas.data.repository.NetworkDashboardRepository

object AppContainer {
    val dashboardRepository: DashboardRepository by lazy {
        NetworkDashboardRepository(NetworkModule.api)
    }
}
