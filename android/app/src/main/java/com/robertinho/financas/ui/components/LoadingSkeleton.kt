package com.robertinho.financas.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LoadingSkeleton() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        repeat(4) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(if (it == 0) 120.dp else 72.dp),
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {}
        }
    }
}
