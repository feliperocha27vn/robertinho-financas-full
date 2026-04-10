package com.robertinho.financas.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun InstallmentRow(
    description: String,
    installmentValue: Double,
    remainingCount: Int,
    totalRemaining: Double
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(description, style = MaterialTheme.typography.bodyLarge)
            Text(formatCurrency(installmentValue), style = MaterialTheme.typography.bodyLarge)
        }
        Text(
            "${formatInstallmentLabel(remainingCount)} • Total: ${formatCurrency(totalRemaining)}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        SectionRowDivider()
    }
}
