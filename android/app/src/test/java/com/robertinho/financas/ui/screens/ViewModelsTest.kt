package com.robertinho.financas.ui.screens

import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.model.OverviewSummaryDto
import com.robertinho.financas.data.model.AccountPayableItemDto
import com.robertinho.financas.data.model.AccountsPayableByDayFifteenDto
import com.robertinho.financas.data.model.InstallmentItemDto
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.model.RemainingInstallmentsDto
import com.robertinho.financas.data.model.SummaryDto
import com.robertinho.financas.data.repository.DashboardRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ViewModelsTest {
    @get:Rule
    val dispatcherRule = MainDispatcherRule()

    @Test
    fun overviewViewModel_emitsSuccess() = runTest {
        val expected = OverviewDto(
            summary = OverviewSummaryDto(1000.0, 2000.0, 1000.0, emptyList()),
            accountsPayableByDayFifteen = AccountsPayableByDayFifteenDto(
                accountsPayableMonth = emptyList(),
                totalAmountForPayByDayFifteen = 0.0
            ),
            remainingInstallments = RemainingInstallmentsDto(
                installments = emptyList(),
                totalOverallRemaining = 0.0
            )
        )
        val vm = OverviewViewModel(FakeRepository(overview = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }

    @Test
    fun summaryViewModel_emitsSuccess() = runTest {
        val expected = SummaryDto(
            balance = 1200.0,
            income = 2500.0,
            expense = 1300.0,
            recentTransactions = emptyList()
        )
        val vm = SummaryViewModel(FakeRepository(summary = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }

    @Test
    fun dayFifteenViewModel_emitsSuccess() = runTest {
        val expected = DayFifteenDto(
            accountsPayableMonth = listOf(AccountPayableItemDto("Aluguel", 450.0)),
            totalAmountForPayByDayFifteen = 450.0
        )
        val vm = DayFifteenViewModel(FakeRepository(dayFifteen = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }

    @Test
    fun installmentsViewModel_emitsSuccess() = runTest {
        val expected = InstallmentsDto(
            installments = listOf(
                InstallmentItemDto(
                    expenseDescription = "Notebook",
                    installmentValue = 250.0,
                    remainingCount = 4,
                    totalRemaining = 1000.0
                )
            ),
            totalOverallRemaining = 1000.0
        )
        val vm = InstallmentsViewModel(FakeRepository(installments = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }
}

private class FakeRepository(
    private val overview: OverviewDto = OverviewDto(
        summary = OverviewSummaryDto(0.0, 0.0, 0.0, emptyList()),
        accountsPayableByDayFifteen = AccountsPayableByDayFifteenDto(emptyList(), 0.0),
        remainingInstallments = RemainingInstallmentsDto(emptyList(), 0.0)
    ),
    private val summary: SummaryDto = SummaryDto(0.0, 0.0, 0.0, emptyList()),
    private val dayFifteen: DayFifteenDto = DayFifteenDto(emptyList(), 0.0),
    private val installments: InstallmentsDto = InstallmentsDto(emptyList(), 0.0)
) : DashboardRepository {
    override suspend fun getOverview(): OverviewDto = overview

    override suspend fun getSummary(): SummaryDto = summary

    override suspend fun getDayFifteen(): DayFifteenDto = dayFifteen

    override suspend fun getInstallments(): InstallmentsDto = installments
}
