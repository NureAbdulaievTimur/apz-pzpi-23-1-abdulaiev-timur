from locust import HttpUser, task, between
import random

class IoTDeviceSimulator(HttpUser):
    host = "http://localhost:8080" 
    wait_time = between(1, 3) 

    def on_start(self):
        self.mac_address = f"MAC-{random.randint(1, 999999)}"
        
        self.client.post("/api/Devices", json={
            "name": f"Simulated Sensor {self.mac_address}",
            "macAddress": self.mac_address
        })

    @task
    def send_telemetry(self):
        payload = {
            "macAddress": self.mac_address,
            "temperature": round(random.uniform(18.0, 30.0), 1),
            "humidity": round(random.uniform(30.0, 70.0), 1),
            "co2Level": round(random.uniform(400, 1200), 1)
        }
        
        self.client.post("/api/Readings", json=payload)