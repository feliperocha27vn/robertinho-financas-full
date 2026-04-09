package com.robertinho.financas.di

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.robertinho.financas.BuildConfig
import com.robertinho.financas.data.network.MobileDashboardApi
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit

object NetworkModule {
    private const val BASE_URL = "https://example.com"

    private val json = Json {
        ignoreUnknownKeys = true
    }

    private val client: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("x-mobile-app-token", BuildConfig.MOBILE_APP_TOKEN)
                .build()
            chain.proceed(request)
        }
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    val api: MobileDashboardApi = retrofit.create(MobileDashboardApi::class.java)
}
