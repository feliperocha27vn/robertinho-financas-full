package com.robertinho.financas.ui.components

import org.junit.Assert.assertEquals
import org.junit.Test

class UiFormattersTest {
    @Test
    fun formatCurrency_formatsBrazilianReal() {
        val normalized = formatCurrency(1244.32).replace('\u00A0', ' ')
        assertEquals("R$ 1.244,32", normalized)
    }

    @Test
    fun formatInstallmentLabel_formatsCount() {
        assertEquals("4 parcelas restantes", formatInstallmentLabel(4))
    }

    @Test
    fun formatCategoryLabel_humanizesCategory() {
        assertEquals("Transport", formatCategoryLabel("TRANSPORT"))
        assertEquals("Food And Drinks", formatCategoryLabel("FOOD_AND_DRINKS"))
    }
}
