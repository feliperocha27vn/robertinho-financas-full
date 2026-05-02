package com.robertinho.financas.ui.screens.recipes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.robertinho.financas.data.model.Recipe
import com.robertinho.financas.data.repository.DashboardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RecipesState(
    val isLoading: Boolean = true,
    val recipes: List<Recipe> = emptyList(),
    val total: Double = 0.0,
    val error: String? = null,
    val showAddDialog: Boolean = false
)

class RecipesViewModel : ViewModel() {
    private val repository = DashboardRepository()

    private val _state = MutableStateFlow(RecipesState())
    val state: StateFlow<RecipesState> = _state.asStateFlow()

    init { loadRecipes() }

    fun loadRecipes() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val recipes = repository.getRecipes()
                _state.value = RecipesState(
                    isLoading = false,
                    recipes = recipes,
                    total = recipes.sumOf { it.amount }
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun showAddDialog() {
        _state.value = _state.value.copy(showAddDialog = true)
    }

    fun hideAddDialog() {
        _state.value = _state.value.copy(showAddDialog = false)
    }

    fun createRecipe(description: String, amount: Double) {
        viewModelScope.launch {
            try {
                repository.createRecipe(
                    com.robertinho.financas.data.model.CreateRecipeRequest(description, amount)
                )
                hideAddDialog()
                loadRecipes()
            } catch (_: Exception) {}
        }
    }

    fun deleteRecipe(id: String) {
        viewModelScope.launch {
            try {
                repository.deleteRecipe(id)
                loadRecipes()
            } catch (_: Exception) {}
        }
    }
}
