package com.robertinho.financas.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun <T> DashboardReadOnlyScreen(
    title: String,
    state: UiState<T>,
    paddingValues: PaddingValues,
    successContent: @Composable (T) -> Unit,
    onRetry: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(text = title)
        when (state) {
            is UiState.Loading -> CircularProgressIndicator()
            is UiState.Success -> successContent(state.data)
            is UiState.Error -> {
                Text(text = state.message)
                Button(onClick = onRetry) {
                    Text("Tentar novamente")
                }
            }
        }
        Button(onClick = onRetry) {
            Text("Atualizar")
        }
    }
}
