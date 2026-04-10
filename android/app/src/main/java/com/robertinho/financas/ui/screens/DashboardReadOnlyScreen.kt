package com.robertinho.financas.ui.screens

import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import com.robertinho.financas.ui.components.ScreenContainer

@Composable
fun <T> DashboardReadOnlyScreen(
    title: String,
    subtitle: String? = null,
    state: UiState<T>,
    paddingValues: PaddingValues,
    loadingContent: LazyListScope.() -> Unit,
    errorContent: LazyListScope.(String) -> Unit,
    successContent: LazyListScope.(T) -> Unit
) {
    ScreenContainer(title = title, subtitle = subtitle, paddingValues = paddingValues) {
        when (state) {
            is UiState.Loading -> loadingContent()
            is UiState.Error -> errorContent(state.message)
            is UiState.Success -> successContent(state.data)
        }
    }
}
