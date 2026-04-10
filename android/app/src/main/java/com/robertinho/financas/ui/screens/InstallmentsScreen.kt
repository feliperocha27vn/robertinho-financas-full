package com.robertinho.financas.ui.screens

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.repository.DashboardRepository
import com.robertinho.financas.ui.components.EmptyStateCard
import com.robertinho.financas.ui.components.ErrorStateCard
import com.robertinho.financas.ui.components.HeroBalanceCard
import com.robertinho.financas.ui.components.InstallmentRow
import com.robertinho.financas.ui.components.LoadingSkeleton
import com.robertinho.financas.ui.components.SectionCard
import com.robertinho.financas.ui.components.formatCurrency

class InstallmentsViewModel(
    private val repository: DashboardRepository
) : BaseDataViewModel<InstallmentsDto>() {
    init {
        refresh()
    }

    override suspend fun fetchData(): InstallmentsDto = repository.getInstallments()
}

@Composable
fun InstallmentsScreen(
    vm: InstallmentsViewModel,
    paddingValues: PaddingValues
) {
    val state by vm.state.collectAsState()
    DashboardReadOnlyScreen(
        title = "Parcelas",
        subtitle = "Acompanhe o que ainda falta quitar.",
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
                    label = "Total restante",
                    value = data.totalOverallRemaining,
                    supportingText = "Soma das parcelas ainda em aberto"
                )
            }
            item {
                SectionCard(title = "Compras parceladas") {
                    Text(
                        "Total restante: ${formatCurrency(data.totalOverallRemaining)}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    if (data.installments.isEmpty()) {
                        EmptyStateCard("Nenhuma parcela restante no momento.")
                    } else {
                        data.installments.forEach {
                            InstallmentRow(
                                description = it.expenseDescription,
                                installmentValue = it.installmentValue,
                                remainingCount = it.remainingCount,
                                totalRemaining = it.totalRemaining
                            )
                        }
                    }
                }
            }
        }
    )
}
