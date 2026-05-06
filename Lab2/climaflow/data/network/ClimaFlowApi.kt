package com.example.climaflow.data.network

import com.example.climaflow.data.models.Device
import com.example.climaflow.data.models.FeedbackDto
import com.example.climaflow.data.models.SensorReading
import com.example.climaflow.data.models.MyRoomResponse
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ClimaFlowApi {
    @GET("api/Devices")
    suspend fun getDevices(): List<Device>

    @GET("api/Readings/history/{deviceId}")
    suspend fun getDeviceHistory(@Path("deviceId") deviceId: Int): List<SensorReading>

    @POST("api/Feedback")
    suspend fun sendFeedback(@Body feedback: FeedbackDto)

    @GET("api/Users/{userId}/my-room")
    suspend fun getMyRoom(@Path("userId") userId: Int): MyRoomResponse
}

object NetworkClient {
    private const val BASE_URL = "http://10.0.2.2:5271/"

    val api: ClimaFlowApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ClimaFlowApi::class.java)
    }
}