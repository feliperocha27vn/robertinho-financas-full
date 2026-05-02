package com.robertinho.financas.ui.screens.expenses

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.robertinho.financas.data.model.Expense
import com.robertinho.financas.ui.screens.dashboard.categoryColor
import com.robertinho.financas.ui.screens.dashboard.formatCurrency
import com.robertinho.financas.ui.theme.AppColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpensesScreen(
    onBack: () -> Unit,
    viewModel: ExpensesViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        containerColor = AppColors.SurfaceInverse,
        topBar = {
            TopAppBar(
                title = { Text("Despesas", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.payAllUnpaid() }) {
                        Text("Pagar todas", color = AppColors.AccentPrimary, fontSize = 14.sp)
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
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Total do mês", fontSize = 14.sp, color = AppColors.ForegroundMuted)
                    Text(
                        formatCurrency(state.total),
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = AppColors.ForegroundInverse
                    )
                }
            }

            if (state.isLoading) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = AppColors.AccentPrimary)
                    }
                }
            } else if (state.expenses.isEmpty()) {
                item {
                    Text(
                        "Nenhuma despesa",
                        color = AppColors.ForegroundMuted,
                        modifier = Modifier.padding(24.dp)
                    )
                }
            }

            items(state.expenses) { expense ->
                ExpenseRow(expense)
            }
        }
    }
}

@Composable
fun ExpenseRow(expense: Expense) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 4.dp),
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
                        .background(categoryColor(expense.category)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Receipt,
                        contentDescription = null,
                        tint = AppColors.ForegroundInverse,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Column {
                    Text(
                        expense.description,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = AppColors.ForegroundInverse
                    )
                    Text(
                        "${expense.category} · ${if (expense.isFixed) "Fixa" else "Variável"}",
                        fontSize = 12.sp,
                        color = AppColors.ForegroundMuted
                    )
                }
            }
            Text(
                "- ${formatCurrency(expense.amount)}",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.Negative
            )
        }
    }
}
