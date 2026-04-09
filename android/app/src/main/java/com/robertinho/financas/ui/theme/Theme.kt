package com.robertinho.financas.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = BronzeAccent,
    secondary = MossMist,
    tertiary = MutedTaupe,
    background = CanvasOat,
    surface = PureSurface,
    onPrimary = PureSurface,
    onSecondary = InkBrown,
    onTertiary = PureSurface,
    onBackground = InkBrown,
    onSurface = InkBrown,
    outline = WhisperLine
)

private val ColorDarkSurface = InkBrown.copy(alpha = 0.9f)

private val DarkColors = darkColorScheme(
    primary = BronzeAccent,
    secondary = MossMist,
    tertiary = MutedTaupe,
    background = InkBrown,
    surface = ColorDarkSurface,
    onPrimary = PureSurface,
    onSecondary = PureSurface,
    onTertiary = PureSurface,
    onBackground = PureSurface,
    onSurface = PureSurface,
    outline = WhisperLine
)

@Composable
fun RobertinhoFinancasTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colors,
        typography = AppTypography,
        content = content
    )
}
