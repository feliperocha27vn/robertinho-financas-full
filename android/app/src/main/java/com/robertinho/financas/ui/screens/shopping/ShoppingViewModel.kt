package com.robertinho.financas.ui.screens.shopping

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.robertinho.financas.data.model.ShoppingListItem
import com.robertinho.financas.data.repository.DashboardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ShoppingState(
    val isLoading: Boolean = true,
    val items: List<ShoppingListItem> = emptyList(),
    val error: String? = null
)

class ShoppingViewModel : ViewModel() {
    private val repository = DashboardRepository()

    private val _state = MutableStateFlow(ShoppingState())
    val state: StateFlow<ShoppingState> = _state.asStateFlow()

    init { loadItems() }

    fun loadItems() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                _state.value = ShoppingState(
                    isLoading = false,
                    items = repository.getShoppingList()
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun addItem(name: String) {
        viewModelScope.launch {
            try {
                repository.addShoppingItem(name)
                loadItems()
            } catch (_: Exception) {}
        }
    }

    fun clearAll() {
        viewModelScope.launch {
            try {
                repository.clearShoppingList()
                loadItems()
            } catch (_: Exception) {}
        }
    }
}
