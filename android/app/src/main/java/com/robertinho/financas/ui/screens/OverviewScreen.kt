package com.robertinho.financas.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.repository.DashboardRepository

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
        title = "Visao Geral",
        state = state,
        paddingValues = paddingValues,
        successContent = { data ->
            Card {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = data.title)
                    Text(text = "Saldo total: R$ ${data.totalBalance}")
                    Text(text = "Entradas: R$ ${data.income}")
                    Text(text = "Saidas: R$ ${data.expenses}")
                }
            }
        },
        onRetry = {
            vm.refresh()
        }
    )
}
