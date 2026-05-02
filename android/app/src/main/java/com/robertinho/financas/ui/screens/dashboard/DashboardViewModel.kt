package com.robertinho.financas.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.robertinho.financas.data.model.*
import com.robertinho.financas.data.repository.DashboardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardState(
    val isLoading: Boolean = true,
    val balance: Double = 0.0,
    val income: Double = 0.0,
    val expense: Double = 0.0,
    val recentTransactions: List<TransactionItem> = emptyList(),
    val accountsPayableTotal: Double = 0.0,
    val totalRemainingInstallments: Double = 0.0,
    val remainingInstallmentCount: Int = 0,
    val error: String? = null
)

class DashboardViewModel : ViewModel() {
    private val repository = DashboardRepository()

    private val _state = MutableStateFlow(DashboardState())
    val state: StateFlow<DashboardState> = _state.asStateFlow()

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val homeData = repository.getHomeData()
                _state.value = _state.value.copy(
                    balance = homeData.balance,
                    income = homeData.income,
                    expense = homeData.expense,
                    recentTransactions = homeData.recentTransactions,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = e.message,
                    isLoading = false
                )
            }
        }

        viewModelScope.launch {
            try {
                val payable = repository.getAccountsPayableByDayFifteen()
                _state.value = _state.value.copy(
                    accountsPayableTotal = payable.totalAmountForPayByDayFifteen
                )
            } catch (_: Exception) {}
        }

        viewModelScope.launch {
            try {
                val installments = repository.getAllRemainingInstallments()
                _state.value = _state.value.copy(
                    totalRemainingInstallments = installments.totalOverallRemaining,
                    remainingInstallmentCount = installments.installments.size
                )
            } catch (_: Exception) {}
        }
    }
}
