package com.robertinho.financas.ui.screens.expenses

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.robertinho.financas.data.model.Expense
import com.robertinho.financas.data.repository.DashboardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ExpensesState(
    val isLoading: Boolean = true,
    val expenses: List<Expense> = emptyList(),
    val total: Double = 0.0,
    val error: String? = null
)

class ExpensesViewModel : ViewModel() {
    private val repository = DashboardRepository()

    private val _state = MutableStateFlow(ExpensesState())
    val state: StateFlow<ExpensesState> = _state.asStateFlow()

    init { loadExpenses() }

    fun loadExpenses() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val expenses = repository.getExpenses()
                _state.value = ExpensesState(
                    isLoading = false,
                    expenses = expenses,
                    total = expenses.sumOf { it.amount }
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun payAllUnpaid() {
        viewModelScope.launch {
            try {
                repository.payAllUnpaid()
                loadExpenses()
            } catch (_: Exception) {}
        }
    }
}
