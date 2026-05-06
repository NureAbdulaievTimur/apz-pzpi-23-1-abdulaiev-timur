package com.example.climaflow.data.models

import com.google.gson.annotations.SerializedName

data class Location(
    val id: Int,
    val name: String
)

data class Device(
    val id: Int,
    val name: String,
    val macAddress: String,
    val isActive: Boolean,
    val location: Location?
)

data class SensorReading(
    val id: Int,
    val temperature: Double,
    val humidity: Double,
    @SerializedName("co2Level") val co2Level: Double,
    val timestamp: String
)

data class FeedbackDto(
    val deviceId: Int,
    val feedbackType: String
)

data class MyRoomResponse(
    val locationName: String,
    val deviceId: Int,
    val deviceName: String
)