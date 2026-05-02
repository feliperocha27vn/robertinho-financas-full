package com.robertinho.financas.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.shape.CircleShape
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
import com.robertinho.financas.data.model.TransactionItem
import com.robertinho.financas.ui.theme.AppColors
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onExpenseClick: () -> Unit,
    onRecipeClick: () -> Unit,
    onShoppingListClick: () -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        containerColor = AppColors.SurfaceInverse
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            item { DashboardHeader() }

            item {
                if (state.isLoading) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = AppColors.AccentPrimary)
                    }
                } else if (state.error != null) {
                    ErrorCard(state.error!!) { viewModel.loadDashboard() }
                } else {
                    BalanceCard(
                        balance = state.balance,
                        income = state.income,
                        expense = state.expense
                    )
                }
            }

            item {
                MiniCardsRow(
                    accountsPayable = state.accountsPayableTotal,
                    remainingInstallments = state.totalRemainingInstallments,
                    installmentCount = state.remainingInstallmentCount,
                    onExpenseClick = onExpenseClick
                )
            }

            item {
                SectionHeader(title = "Transações recentes")
            }

            if (state.recentTransactions.isEmpty() && !state.isLoading) {
                item {
                    Text(
                        "Nenhuma transação ainda",
                        color = AppColors.ForegroundMuted,
                        modifier = Modifier.padding(horizontal = 24.dp)
                    )
                }
            }

            items(state.recentTransactions) { transaction ->
                TransactionRow(transaction)
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
                QuickLinksRow(
                    onExpenseClick = onExpenseClick,
                    onRecipeClick = onRecipeClick,
                    onShoppingListClick = onShoppingListClick
                )
            }
        }
    }
}

@Composable
fun DashboardHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                "Olá, Felipe Rocha",
                fontSize = 28.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.ForegroundInverse
            )
            Text(
                "Abril 2026",
                fontSize = 14.sp,
                color = AppColors.ForegroundMuted
            )
        }
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(AppColors.AccentPrimary),
            contentAlignment = Alignment.Center
        ) {
            Text(
                "R",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.ForegroundInverse
            )
        }
    }
}

@Composable
fun BalanceCard(balance: Double, income: Double, expense: Double) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.AccentSecondary)
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                "Saldo disponível",
                fontSize = 14.sp,
                color = AppColors.ForegroundMuted
            )
            Text(
                formatCurrency(balance),
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                color = AppColors.ForegroundInverse
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                Column {
                    Text("Receitas", fontSize = 12.sp, color = AppColors.ForegroundMuted)
                    Text(
                        "+ ${formatCurrency(income)}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppColors.Positive
                    )
                }
                Column {
                    Text("Despesas", fontSize = 12.sp, color = AppColors.ForegroundMuted)
                    Text(
                        "- ${formatCurrency(expense)}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AppColors.Negative
                    )
                }
            }
        }
    }
}

@Composable
fun MiniCardsRow(
    accountsPayable: Double,
    remainingInstallments: Double,
    installmentCount: Int,
    onExpenseClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card(
            modifier = Modifier
                .weight(1f)
                .clickable { onExpenseClick() },
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(AppColors.Warning),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = null,
                        tint = AppColors.ForegroundInverse,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text("A pagar dia 15", fontSize = 12.sp, color = AppColors.ForegroundMuted)
                Text(
                    formatCurrency(accountsPayable),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.ForegroundInverse
                )
            }
        }

        Card(
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(AppColors.AccentPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.CalendarMonth,
                        contentDescription = null,
                        tint = AppColors.ForegroundInverse,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text("Parcelas restantes", fontSize = 12.sp, color = AppColors.ForegroundMuted)
                Text(
                    formatCurrency(remainingInstallments),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = AppColors.ForegroundInverse
                )
                Text(
                    "$installmentCount parcelas",
                    fontSize = 12.sp,
                    color = AppColors.AccentPrimary
                )
            }
        }
    }
}

@Composable
fun SectionHeader(title: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            title,
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = AppColors.ForegroundInverse
        )
        Text(
            "Ver todas",
            fontSize = 14.sp,
            color = AppColors.AccentPrimary
        )
    }
}

@Composable
fun TransactionRow(transaction: TransactionItem) {
    val isPositive = transaction.amount > 0
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 4.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
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
                        .background(
                            if (isPositive) AppColors.Positive
                            else categoryColor(transaction.category)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (isPositive) Icons.Default.TrendingUp
                        else Icons.Default.TrendingDown,
                        contentDescription = null,
                        tint = AppColors.ForegroundInverse,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Column {
                    Text(
                        transaction.description,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = AppColors.ForegroundInverse
                    )
                    Text(
                        transaction.category,
                        fontSize = 12.sp,
                        color = AppColors.ForegroundMuted
                    )
                }
            }
            Text(
                "${if (isPositive) "+" else "-"} ${formatCurrency(kotlin.math.abs(transaction.amount))}",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isPositive) AppColors.Positive else AppColors.Negative
            )
        }
    }
}

@Composable
fun ErrorCard(message: String, onRetry: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Erro ao carregar", color = AppColors.Negative)
            Text(message, color = AppColors.ForegroundMuted, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            TextButton(onClick = onRetry) {
                Text("Tentar novamente", color = AppColors.AccentPrimary)
            }
        }
    }
}

@Composable
fun QuickLinksRow(
    onExpenseClick: () -> Unit,
    onRecipeClick: () -> Unit,
    onShoppingListClick: () -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 24.dp)) {
        Text(
            "Acesso rápido",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = AppColors.ForegroundInverse
        )
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            QuickLinkCard("Despesas", Icons.Default.Money, AppColors.Negative, onExpenseClick)
            QuickLinkCard("Receitas", Icons.Default.TrendingUp, AppColors.Positive, onRecipeClick)
            QuickLinkCard("Compras", Icons.Default.ShoppingCart, AppColors.Warning, onShoppingListClick)
        }
    }
}

@Composable
fun RowScope.QuickLinkCard(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: androidx.compose.ui.graphics.Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .weight(1f)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                label,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = AppColors.ForegroundInverse
            )
        }
    }
}

fun formatCurrency(value: Double): String {
    val format = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
    return format.format(value)
}

fun categoryColor(category: String): androidx.compose.ui.graphics.Color = when (category) {
    "RESIDENCE" -> AppColors.Negative
    "TRANSPORT" -> AppColors.Warning
    "STUDIES" -> AppColors.Purple
    "CREDIT" -> AppColors.AccentPrimary
    else -> AppColors.ForegroundMuted
}
