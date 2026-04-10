package com.robertinho.financas

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.ViewWeek
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.robertinho.financas.di.AppContainer
import com.robertinho.financas.ui.screens.DayFifteenScreen
import com.robertinho.financas.ui.screens.DayFifteenViewModel
import com.robertinho.financas.ui.screens.InstallmentsScreen
import com.robertinho.financas.ui.screens.InstallmentsViewModel
import com.robertinho.financas.ui.screens.OverviewScreen
import com.robertinho.financas.ui.screens.OverviewViewModel
import com.robertinho.financas.ui.screens.SummaryScreen
import com.robertinho.financas.ui.screens.SummaryViewModel
import com.robertinho.financas.ui.theme.RobertinhoFinancasTheme

enum class DashboardRoute(val path: String, val label: String) {
    OVERVIEW("overview", "Visão Geral"),
    SUMMARY("summary", "Resumo"),
    DAY_FIFTEEN("day15", "Até dia 15"),
    INSTALLMENTS("installments", "Parcelas")
}

private data class BottomDestination(
    val route: DashboardRoute,
    val icon: @Composable () -> Unit
)

@Composable
fun RobertinhoApp(
    container: AppContainer = AppContainer
) {
    RobertinhoFinancasTheme {
        val navController = rememberNavController()
        val destinations = listOf(
            BottomDestination(DashboardRoute.OVERVIEW) {
                Icon(Icons.Default.Dashboard, contentDescription = null)
            },
            BottomDestination(DashboardRoute.SUMMARY) {
                Icon(Icons.Default.ViewWeek, contentDescription = null)
            },
            BottomDestination(DashboardRoute.DAY_FIFTEEN) {
                Icon(Icons.Default.CalendarMonth, contentDescription = null)
            },
            BottomDestination(DashboardRoute.INSTALLMENTS) {
                Icon(Icons.AutoMirrored.Filled.ListAlt, contentDescription = null)
            }
        )

        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 0.dp
                ) {
                    val navBackStackEntry by navController.currentBackStackEntryAsState()
                    val currentDestination = navBackStackEntry?.destination
                    destinations.forEach { destination ->
                        NavigationBarItem(
                            selected = currentDestination
                                ?.hierarchy
                                ?.any { it.route == destination.route.path } == true,
                            onClick = {
                                navController.navigate(destination.route.path) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = destination.icon,
                            label = { Text(destination.route.label) }
                        )
                    }
                }
            }
        ) { paddingValues ->
            NavHost(
                modifier = Modifier,
                navController = navController,
                startDestination = DashboardRoute.OVERVIEW.path
            ) {
                composable(DashboardRoute.OVERVIEW.path) {
                    val vm: OverviewViewModel = viewModel {
                        OverviewViewModel(container.dashboardRepository)
                    }
                    OverviewScreen(vm, paddingValues)
                }
                composable(DashboardRoute.SUMMARY.path) {
                    val vm: SummaryViewModel = viewModel {
                        SummaryViewModel(container.dashboardRepository)
                    }
                    SummaryScreen(vm, paddingValues)
                }
                composable(DashboardRoute.DAY_FIFTEEN.path) {
                    val vm: DayFifteenViewModel = viewModel {
                        DayFifteenViewModel(container.dashboardRepository)
                    }
                    DayFifteenScreen(vm, paddingValues)
                }
                composable(DashboardRoute.INSTALLMENTS.path) {
                    val vm: InstallmentsViewModel = viewModel {
                        InstallmentsViewModel(container.dashboardRepository)
                    }
                    InstallmentsScreen(vm, paddingValues)
                }
            }
        }
    }
}
