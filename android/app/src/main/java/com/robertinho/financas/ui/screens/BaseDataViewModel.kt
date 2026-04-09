package com.robertinho.financas.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

abstract class BaseDataViewModel<T> : ViewModel() {
    private val _state = MutableStateFlow<UiState<T>>(UiState.Loading)
    val state: StateFlow<UiState<T>> = _state.asStateFlow()

    fun refresh() {
        _state.value = UiState.Loading
        viewModelScope.launch {
            runCatching { fetchData() }
                .onSuccess { _state.value = UiState.Success(it) }
                .onFailure {
                    _state.value = UiState.Error(
                        it.message ?: "Nao foi possivel carregar os dados"
                    )
                }
        }
    }

    protected abstract suspend fun fetchData(): T
}
