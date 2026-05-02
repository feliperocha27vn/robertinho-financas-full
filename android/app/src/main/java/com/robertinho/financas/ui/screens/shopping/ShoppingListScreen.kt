package com.robertinho.financas.ui.screens.shopping

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.robertinho.financas.ui.theme.AppColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShoppingListScreen(
    onBack: () -> Unit,
    viewModel: ShoppingViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()
    var newItem by remember { mutableStateOf("") }

    Scaffold(
        containerColor = AppColors.SurfaceInverse,
        topBar = {
            TopAppBar(
                title = { Text("Lista de compras", fontWeight = FontWeight.SemiBold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    TextButton(onClick = { viewModel.clearAll() }) {
                        Text("Limpar", color = AppColors.Negative, fontSize = 14.sp)
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
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = newItem,
                    onValueChange = { newItem = it },
                    placeholder = { Text("Adicionar item...", color = AppColors.ForegroundMuted) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(22.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = AppColors.ForegroundInverse,
                        unfocusedTextColor = AppColors.ForegroundInverse,
                        focusedBorderColor = AppColors.AccentPrimary,
                        unfocusedBorderColor = AppColors.BorderSubtle
                    )
                )
                IconButton(
                    onClick = {
                        if (newItem.isNotBlank()) {
                            viewModel.addItem(newItem.trim())
                            newItem = ""
                        }
                    },
                    modifier = Modifier.size(44.dp)
                ) {
                    Icon(
                        Icons.Default.AddCircle,
                        contentDescription = "Adicionar",
                        tint = AppColors.AccentPrimary,
                        modifier = Modifier.size(44.dp)
                    )
                }
            }

            if (state.isLoading) {
                Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AppColors.AccentPrimary)
                }
            } else if (state.items.isEmpty()) {
                Text(
                    "Lista vazia",
                    color = AppColors.ForegroundMuted,
                    modifier = Modifier.padding(24.dp)
                )
            }

            LazyColumn(contentPadding = PaddingValues(horizontal = 24.dp, vertical = 4.dp)) {
                items(state.items) { item ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = CardDefaults.cardColors(containerColor = AppColors.CardBackground)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                item.name,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = AppColors.ForegroundInverse
                            )
                            Icon(
                                Icons.Default.Close,
                                contentDescription = null,
                                tint = AppColors.ForegroundMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
