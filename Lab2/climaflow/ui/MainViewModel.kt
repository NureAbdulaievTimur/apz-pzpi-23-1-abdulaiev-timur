package com.example.climaflow.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.climaflow.data.models.Device
import com.example.climaflow.data.models.FeedbackDto
import com.example.climaflow.data.models.SensorReading
import com.example.climaflow.data.models.MyRoomResponse
import com.example.climaflow.data.network.NetworkClient
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState

    private val _snackbarMessage = MutableSharedFlow<String>()
    val snackbarMessage: SharedFlow<String> = _snackbarMessage.asSharedFlow()

    private var currentDeviceId: Int? = null

    init {
        fetchData()
    }

    private val CURRENT_USER_ID = 1

    private fun fetchData() {
        viewModelScope.launch {
            while (true) {
                try {
                    val myRoom = NetworkClient.api.getMyRoom(CURRENT_USER_ID)
                    currentDeviceId = myRoom.deviceId

                    val history = NetworkClient.api.getDeviceHistory(myRoom.deviceId)
                    val latestReading = history.firstOrNull()

                    if (latestReading != null) {
                        _uiState.value = UiState.Success(
                            locationName = myRoom.locationName,
                            reading = latestReading
                        )
                    } else {
                        _uiState.value = UiState.Error("Очікування даних від сенсорів...")
                    }
                } catch (e: Exception) {
                    println("Помилка: ${e.message}")
                    if (e.message?.contains("404") == true) {
                        _uiState.value = UiState.Error("Вас не призначено до жодної кімнати, або в кімнаті немає сенсора.")
                    }
                }
                delay(5000)
            }
        }
    }

    fun sendFeedback(type: String) {
        viewModelScope.launch {
            try {
                currentDeviceId?.let { id ->
                    NetworkClient.api.sendFeedback(FeedbackDto(id, type))
                    _snackbarMessage.emit("Дякуємо! Ваш відгук успішно враховано 💙")
                }
            } catch (e: Exception) {
                _snackbarMessage.emit("Помилка з'єднання з сервером 😔")
            }
        }
    }
}

sealed class UiState {
    object Loading : UiState()
    data class Success(val locationName: String, val reading: SensorReading) : UiState()
    data class Error(val message: String) : UiState()
}