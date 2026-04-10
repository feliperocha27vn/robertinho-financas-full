package com.robertinho.financas.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.robertinho.financas.data.model.SummaryDto
import com.robertinho.financas.data.repository.DashboardRepository
import com.robertinho.financas.ui.components.EmptyStateCard
import com.robertinho.financas.ui.components.ErrorStateCard
import com.robertinho.financas.ui.components.HeroBalanceCard
import com.robertinho.financas.ui.components.LoadingSkeleton
import com.robertinho.financas.ui.components.MetricCard
import com.robertinho.financas.ui.components.SectionCard
import com.robertinho.financas.ui.components.TransactionRow

class SummaryViewModel(
    private val repository: DashboardRepository
) : BaseDataViewModel<SummaryDto>() {
    init {
        refresh()
    }

    override suspend fun fetchData(): SummaryDto = repository.getSummary()
}

@Composable
fun SummaryScreen(
    vm: SummaryViewModel,
    paddingValues: PaddingValues
) {
    val state by vm.state.collectAsState()
    DashboardReadOnlyScreen(
        title = "Resumo",
        subtitle = "Saldo, entradas e saídas do período atual.",
        state = state,
        paddingValues = paddingValues,
        loadingContent = {
            item { LoadingSkeleton() }
        },
        errorContent = { message ->
            item { ErrorStateCard(message, vm::refresh) }
        },
        successContent = { data ->
            item {
                HeroBalanceCard(
                    label = "Saldo atual",
                    value = data.balance,
                    supportingText = "Visão financeira consolidada"
                )
            }
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricCard("Entradas", data.income, Modifier.weight(1f))
                    MetricCard("Saídas", data.expense, Modifier.weight(1f))
                }
            }
            item {
                SectionCard(title = "Transações recentes") {
                    if (data.recentTransactions.isEmpty()) {
                        EmptyStateCard("Ainda não há transações recentes para mostrar.")
                    } else {
                        data.recentTransactions.forEach {
                            TransactionRow(it.description, it.category, it.amount)
                        }
                    }
                }
            }
        }
    )
}
