package com.robertinho.financas.ui.components

import java.text.NumberFormat
import java.util.Locale

private val brazilLocale = Locale("pt", "BR")

fun formatCurrency(value: Double): String =
    NumberFormat.getCurrencyInstance(brazilLocale).format(value)

fun formatInstallmentLabel(count: Int): String =
    if (count == 1) "1 parcela restante" else "$count parcelas restantes"
