package com.robertinho.financas.ui.screens

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.repository.DashboardRepository
import com.robertinho.financas.ui.components.EmptyStateCard
import com.robertinho.financas.ui.components.ErrorStateCard
import com.robertinho.financas.ui.components.HeroBalanceCard
import com.robertinho.financas.ui.components.LoadingSkeleton
import com.robertinho.financas.ui.components.PayableRow
import com.robertinho.financas.ui.components.SectionCard

class DayFifteenViewModel(
    private val repository: DashboardRepository
) : BaseDataViewModel<DayFifteenDto>() {
    init {
        refresh()
    }

    override suspend fun fetchData(): DayFifteenDto = repository.getDayFifteen()
}

@Composable
fun DayFifteenScreen(
    vm: DayFifteenViewModel,
    paddingValues: PaddingValues
) {
    val state by vm.state.collectAsState()
    DashboardReadOnlyScreen(
        title = "Até o dia 15",
        subtitle = "Tudo o que merece atenção no curto prazo.",
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
                    label = "Total previsto",
                    value = data.totalAmountForPayByDayFifteen,
                    supportingText = "Compromissos financeiros antes do dia 15"
                )
            }
            item {
                SectionCard(title = "Contas a pagar") {
                    if (data.accountsPayableMonth.isEmpty()) {
                        EmptyStateCard("Nenhuma conta pendente até o dia 15.")
                    } else {
                        data.accountsPayableMonth.forEach {
                            PayableRow(it.description, it.amount)
                        }
                    }
                }
            }
        }
    )
}
