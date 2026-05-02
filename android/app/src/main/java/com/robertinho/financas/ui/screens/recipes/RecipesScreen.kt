package com.robertinho.financas.ui.screens.recipes

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.robertinho.financas.data.model.Recipe
import com.robertinho.financas.ui.screens.dashboard.formatCurrency
import com.robertinho.financas.ui.theme.AppColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecipesScreen(
    onBack: () -> Unit,
    viewModel: RecipesViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()

    if (state.showAddDialog) {
        AddRecipeDialog(
            onDismiss = { viewModel.hideAddDialog() },
            onConfirm = { desc, amount -> viewModel.createRecipe(desc, amount) }
        )
    }

    Scaffold(
        containerColor = AppColors.SurfaceInverse,
        topBar = {
            TopAppBar(
                title = { Text("Receitas", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.showAddDialog() }) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Adicionar",
                            tint = AppColors.AccentPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AppColors.SurfaceInverse,
                    titleContentColor = AppColors.ForegroundInverse,
                    navigationIconContentColor = AppColors.ForegroundInverse
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Total do mês", fontSize = 14.sp, color = AppColors.ForegroundMuted)
                    Text(
                        formatCurrency(state.total),
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.Positive
                    )
                }
            }

            if (state.isLoading) {
                item {
                    Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = AppColors.AccentPrimary)
                    }
                }
            } else if (state.recipes.isEmpty()) {
                item {
                    Text("Nenhuma receita", color = AppColors.ForegroundMuted, modifier = Modifier.padding(24.dp))
                }
            }

            items(state.recipes) { recipe ->
                RecipeRow(recipe) { viewModel.deleteRecipe(recipe.id) }
            }
        }
    }
}

@Composable
fun RecipeRow(recipe: Recipe, onDelete: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 4.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(AppColors.Positive),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.TrendingUp, null, tint = AppColors.ForegroundInverse, modifier = Modifier.size(20.dp))
                }
                Column {
                    Text(recipe.description, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = AppColors.ForegroundInverse)
                    Text(recipe.createdAt.take(10), fontSize = 12.sp, color = AppColors.ForegroundMuted)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "+ ${formatCurrency(recipe.amount)}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AppColors.Positive
                )
                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(Icons.Default.Delete, "Deletar", tint = AppColors.ForegroundMuted, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
fun AddRecipeDialog(onDismiss: () -> Unit, onConfirm: (String, Double) -> Unit) {
    var description by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = AppColors.CardBackground,
        title = { Text("Nova receita", color = AppColors.ForegroundInverse) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Descrição") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = AppColors.ForegroundInverse,
                        unfocusedTextColor = AppColors.ForegroundInverse,
                        focusedBorderColor = AppColors.AccentPrimary,
                        unfocusedBorderColor = AppColors.BorderSubtle,
                        focusedLabelColor = AppColors.AccentPrimary,
                        unfocusedLabelColor = AppColors.ForegroundMuted
                    )
                )
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Valor") },
                    prefix = { Text("R$", color = AppColors.ForegroundMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = AppColors.ForegroundInverse,
                        unfocusedTextColor = AppColors.ForegroundInverse,
                        focusedBorderColor = AppColors.AccentPrimary,
                        unfocusedBorderColor = AppColors.BorderSubtle,
                        focusedLabelColor = AppColors.AccentPrimary,
                        unfocusedLabelColor = AppColors.ForegroundMuted
                    )
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val amt = amount.toDoubleOrNull()
                if (description.isNotBlank() && amt != null && amt > 0) {
                    onConfirm(description, amt)
                }
            }) {
                Text("Salvar", color = AppColors.AccentPrimary)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar", color = AppColors.ForegroundMuted)
            }
        }
    )
}
