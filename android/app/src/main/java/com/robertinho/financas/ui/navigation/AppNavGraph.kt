package com.robertinho.financas.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.robertinho.financas.ui.screens.dashboard.DashboardScreen
import com.robertinho.financas.ui.screens.expenses.ExpensesScreen
import com.robertinho.financas.ui.screens.recipes.RecipesScreen
import com.robertinho.financas.ui.screens.shopping.ShoppingListScreen

sealed class Screen(val route: String) {
    data object Dashboard : Screen("dashboard")
    data object Expenses : Screen("expenses")
    data object Recipes : Screen("recipes")
    data object ShoppingList : Screen("shopping-list")
}

@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onExpenseClick = { navController.navigate(Screen.Expenses.route) },
                onRecipeClick = { navController.navigate(Screen.Recipes.route) },
                onShoppingListClick = { navController.navigate(Screen.ShoppingList.route) }
            )
        }

        composable(Screen.Expenses.route) {
            ExpensesScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Recipes.route) {
            RecipesScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.ShoppingList.route) {
            ShoppingListScreen(onBack = { navController.popBackStack() })
        }
    }
}
