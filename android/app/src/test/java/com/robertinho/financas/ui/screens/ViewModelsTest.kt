package com.robertinho.financas.ui.screens

import com.robertinho.financas.data.model.DayFifteenDto
import com.robertinho.financas.data.model.InstallmentItemDto
import com.robertinho.financas.data.model.InstallmentsDto
import com.robertinho.financas.data.model.OverviewDto
import com.robertinho.financas.data.model.SummaryCategoryDto
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
        val expected = OverviewDto("Painel", 1000.0, 2000.0, 1000.0)
        val vm = OverviewViewModel(FakeRepository(overview = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }

    @Test
    fun summaryViewModel_emitsSuccess() = runTest {
        val expected = SummaryDto("Abr/2026", listOf(SummaryCategoryDto("Casa", 300.0)))
        val vm = SummaryViewModel(FakeRepository(summary = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }

    @Test
    fun dayFifteenViewModel_emitsSuccess() = runTest {
        val expected = DayFifteenDto(3, 450.0, 7)
        val vm = DayFifteenViewModel(FakeRepository(dayFifteen = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }

    @Test
    fun installmentsViewModel_emitsSuccess() = runTest {
        val expected = InstallmentsDto(
            items = listOf(InstallmentItemDto("Notebook", 250.0, 4))
        )
        val vm = InstallmentsViewModel(FakeRepository(installments = expected))

        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Success)
        assertEquals(expected, (vm.state.value as UiState.Success).data)
    }
}

private class FakeRepository(
    private val overview: OverviewDto = OverviewDto("", 0.0, 0.0, 0.0),
    private val summary: SummaryDto = SummaryDto("", emptyList()),
    private val dayFifteen: DayFifteenDto = DayFifteenDto(0, 0.0, 0),
    private val installments: InstallmentsDto = InstallmentsDto(emptyList())
) : DashboardRepository {
    override suspend fun getOverview(): OverviewDto = overview

    override suspend fun getSummary(): SummaryDto = summary

    override suspend fun getDayFifteen(): DayFifteenDto = dayFifteen

    override suspend fun getInstallments(): InstallmentsDto = installments
}
