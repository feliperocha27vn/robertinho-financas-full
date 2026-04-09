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
import com.robertinho.financas.data.model.SummaryDto
import com.robertinho.financas.data.repository.DashboardRepository

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
        state = state,
        paddingValues = paddingValues,
        successContent = { data ->
            Card {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Periodo: ${data.period}")
                    data.categoryTotals.forEach { item ->
                        Text("${item.name}: R$ ${item.amount}")
                    }
                }
            }
        },
        onRetry = {
            vm.refresh()
        }
    )
}
