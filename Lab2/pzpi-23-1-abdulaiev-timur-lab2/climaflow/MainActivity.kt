package com.example.climaflow

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.climaflow.ui.MainViewModel
import com.example.climaflow.ui.UiState
import kotlinx.coroutines.flow.collectLatest

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                ClimaFlowApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClimaFlowApp(viewModel: MainViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.snackbarMessage.collectLatest { message ->
            snackbarHostState.showSnackbar(
                message = message,
                duration = SnackbarDuration.Short
            )
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("ClimaFlow", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .background(Color(0xFFF5F7FA))
        ) {
            when (val state = uiState) {
                is UiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is UiState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is UiState.Success -> {
                    DashboardScreen(
                        locationName = state.locationName,
                        temperature = state.reading.temperature,
                        humidity = state.reading.humidity,
                        co2 = state.reading.co2Level,
                        onFeedbackClick = { type -> viewModel.sendFeedback(type) }
                    )
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(
    locationName: String,
    temperature: Double,
    humidity: Double,
    co2: Double,
    onFeedbackClick: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Локація",
            fontSize = 14.sp,
            color = Color.Gray
        )
        Text(
            text = locationName,
            fontSize = 28.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF1E293B),
            modifier = Modifier.padding(bottom = 24.dp)
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            MetricCard(
                modifier = Modifier.weight(1f),
                title = "Температура",
                icon = "🌡️",
                value = "${temperature}°C",
                valueColor = if (temperature > 25 || temperature < 18) Color(0xFFE53935) else Color(0xFF43A047)
            )
            MetricCard(
                modifier = Modifier.weight(1f),
                title = "Вологість",
                icon = "💧",
                value = "${humidity}%",
                valueColor = Color(0xFF1E88E5)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))

        val co2Color = if (co2 > 800) Color(0xFFE53935) else Color(0xFF43A047)
        MetricCard(
            modifier = Modifier.fillMaxWidth(),
            title = "Якість повітря (CO₂)",
            icon = "💨",
            value = "${co2} ppm",
            valueColor = co2Color
        )

        AnimatedVisibility(visible = co2 > 800) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(16.dp)
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFE53935))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Увага! Високий рівень CO₂. Система активує вентиляцію.", color = Color(0xFFC62828))
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Оцініть комфорт у приміщенні",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color(0xFF374151)
                )
                Text(
                    text = "ШІ адаптує клімат під ваші вподобання",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    FeedbackButton("Холодно", "🥶", Color(0xFFE3F2FD), Color(0xFF1E88E5)) { onFeedbackClick("COLD") }
                    FeedbackButton("Комфортно", "👍", Color(0xFFE8F5E9), Color(0xFF43A047)) { onFeedbackClick("PERFECT") }
                    FeedbackButton("Спекотно", "🥵", Color(0xFFFFEBEE), Color(0xFFE53935)) { onFeedbackClick("HOT") }
                }
            }
        }
    }
}

@Composable
fun MetricCard(modifier: Modifier = Modifier, title: String, icon: String, value: String, valueColor: Color) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = icon, fontSize = 20.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = title, fontSize = 14.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = valueColor
            )
        }
    }
}

@Composable
fun RowScope.FeedbackButton(
    text: String,
    emoji: String,
    bgColor: Color,
    contentColor: Color,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = bgColor, contentColor = contentColor),
        shape = RoundedCornerShape(16.dp),
        contentPadding = PaddingValues(vertical = 12.dp),
        modifier = Modifier.weight(1f).padding(horizontal = 4.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = emoji, fontSize = 24.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = text, fontSize = 10.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        }
    }
}