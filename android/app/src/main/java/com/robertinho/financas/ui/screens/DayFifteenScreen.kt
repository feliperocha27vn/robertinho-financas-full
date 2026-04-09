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
import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.repository.DashboardRepository

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
        title = "Ate dia 15",
        state = state,
        paddingValues = paddingValues,
        successContent = { data ->
            Card {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Contas a vencer: ${data.dueCount}")
                    Text("Valor total: R$ ${data.dueAmount}")
                    Text("Dias restantes: ${data.remainingDays}")
                }
            }
        },
        onRetry = {
            vm.refresh()
        }
    )
}
