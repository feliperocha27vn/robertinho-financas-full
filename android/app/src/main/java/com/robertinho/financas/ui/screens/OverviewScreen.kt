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
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.repository.DashboardRepository
import com.robertinho.financas.ui.components.EmptyStateCard
import com.robertinho.financas.ui.components.ErrorStateCard
import com.robertinho.financas.ui.components.HeroBalanceCard
import com.robertinho.financas.ui.components.InstallmentRow
import com.robertinho.financas.ui.components.LoadingSkeleton
import com.robertinho.financas.ui.components.MetricCard
import com.robertinho.financas.ui.components.PayableRow
import com.robertinho.financas.ui.components.SectionCard
import com.robertinho.financas.ui.components.TransactionRow
import com.robertinho.financas.ui.components.formatCurrency

class OverviewViewModel(
    private val repository: DashboardRepository
) : BaseDataViewModel<OverviewDto>() {
    init {
        refresh()
    }

    override suspend fun fetchData(): OverviewDto = repository.getOverview()
}

@Composable
fun OverviewScreen(
    vm: OverviewViewModel,
    paddingValues: PaddingValues
) {
    val state by vm.state.collectAsState()
    DashboardReadOnlyScreen(
        title = "Visão Geral",
        subtitle = "Atualizado com base nos seus lançamentos mais recentes.",
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
                    value = data.summary.balance,
                    supportingText = "Leitura rápida do seu momento financeiro"
                )
            }
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricCard(
                        label = "Entradas do mês",
                        value = data.summary.income,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        label = "Saídas do mês",
                        value = data.summary.expense,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            item {
                SectionCard(title = "Até o dia 15") {
                    Text(
                        "Total previsto: ${formatCurrency(data.accountsPayableByDayFifteen.totalAmountForPayByDayFifteen)}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    if (data.accountsPayableByDayFifteen.accountsPayableMonth.isEmpty()) {
                        EmptyStateCard("Nenhuma conta pendente até o dia 15.")
                    } else {
                        data.accountsPayableByDayFifteen.accountsPayableMonth.take(4).forEach {
                            PayableRow(it.description, it.amount)
                        }
                    }
                }
            }
            item {
                SectionCard(title = "Parcelas restantes") {
                    Text(
                        "Total restante: ${formatCurrency(data.remainingInstallments.totalOverallRemaining)}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    if (data.remainingInstallments.installments.isEmpty()) {
                        EmptyStateCard("Nenhuma parcela restante no momento.")
                    } else {
                        data.remainingInstallments.installments.take(3).forEach {
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
            item {
                SectionCard(title = "Transações recentes") {
                    if (data.summary.recentTransactions.isEmpty()) {
                        EmptyStateCard("Ainda não há transações recentes para mostrar.")
                    } else {
                        data.summary.recentTransactions.take(5).forEach {
                            TransactionRow(it.description, it.category, it.amount)
                        }
                    }
                }
            }
        }
    )
}
