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
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.repository.DashboardRepository

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
        state = state,
        paddingValues = paddingValues,
        successContent = { data ->
            Card {
                Column(modifier = Modifier.padding(16.dp)) {
                    data.items.forEach { item ->
                        Text("${item.label}: R$ ${item.amount} (${item.remainingInstallments}x)")
                    }
                }
            }
        },
        onRetry = {
            vm.refresh()
        }
    )
}
