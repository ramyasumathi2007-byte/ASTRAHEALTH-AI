from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ASTRAHEALTH AI API",
    description="Simulated astronaut health and mission-environment monitoring prototype.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All values below are illustrative demo data, not clinical thresholds.
BASELINE = {"heart_rate": 70, "spo2": 98, "sleep_hours": 7.5, "stress": 3}
CURRENT = {
    "heart_rate": 72,
    "spo2": 98,
    "sleep_hours": 7.1,
    "stress": 3,
    "temperature_c": 36.8,
    "blood_pressure": "118/76",
    "activity_minutes": 42,
}
ENVIRONMENT = {
    "co2_ppm": 950,
    "cabin_temperature_c": 22.4,
    "humidity_percent": 46,
    "radiation_msv": 0.42,
    "sensor_status": "All demo sensors reporting",
    "updated_at": datetime.now(timezone.utc).isoformat(),
}

HISTORY = [
    {"day": "D39", "heart_rate": 69, "spo2": 98, "sleep": 7.4, "stress": 3},
    {"day": "D40", "heart_rate": 71, "spo2": 98, "sleep": 7.0, "stress": 4},
    {"day": "D41", "heart_rate": 70, "spo2": 97, "sleep": 7.6, "stress": 3},
    {"day": "D42", "heart_rate": 73, "spo2": 98, "sleep": 6.8, "stress": 4},
    {"day": "D43", "heart_rate": 71, "spo2": 99, "sleep": 7.2, "stress": 2},
    {"day": "D44", "heart_rate": 70, "spo2": 98, "sleep": 7.5, "stress": 3},
    {"day": "D45", "heart_rate": 72, "spo2": 98, "sleep": 7.1, "stress": 3},
]

class CheckIn(BaseModel):
    mood: str = Field(min_length=1, max_length=30)
    stress: int = Field(ge=0, le=10)
    sleep_hours: float = Field(ge=0, le=24)
    note: Optional[str] = Field(default="", max_length=500)

class AcknowledgeRequest(BaseModel):
    acknowledged: bool = True

ALERTS = [
    {
        "id": "A-001",
        "severity": "info",
        "title": "Health readings within demo baseline",
        "evidence": "Heart rate 72 BPM vs demo baseline 70 BPM; SpO₂ 98%.",
        "recommended_action": "Continue routine self-monitoring and follow mission-approved procedures.",
        "acknowledged": False,
    },
    {
        "id": "A-002",
        "severity": "info",
        "title": "Sleep trend available",
        "evidence": "Last recorded sleep duration is 7.1 hours.",
        "recommended_action": "Review the sleep trend during the daily wellbeing check-in.",
        "acknowledged": False,
    },
]

CHECKINS = []

def build_explanations():
    return {
        key: {"current": CURRENT[key], "baseline": BASELINE[key],
              "difference": round(CURRENT[key] - BASELINE[key], 1)}
        for key in BASELINE
    }

@app.get("/")
def root():
    return {"message": "ASTRAHEALTH AI API is running", "demo_data": True}

@app.get("/api/dashboard")
def dashboard():
    return {
        "mission_day": 45,
        "crew_status": "Demo data — review trends",
        "simulated": True,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "vitals": CURRENT,
        "baseline_comparison": build_explanations(),
        "environment": ENVIRONMENT,
    }

@app.get("/api/history")
def history():
    return {"simulated": True, "items": HISTORY}

@app.get("/api/environment")
def environment():
    return {"simulated": True, **ENVIRONMENT}

@app.get("/api/alerts")
def get_alerts():
    return {"simulated": True, "items": ALERTS}

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, body: AcknowledgeRequest):
    for alert in ALERTS:
        if alert["id"] == alert_id:
            alert["acknowledged"] = body.acknowledged
            return {"ok": True, "alert": alert}
    return {"ok": False, "message": "Alert not found"}

@app.post("/api/checkin")
def create_checkin(checkin: CheckIn):
    entry = checkin.model_dump()
    entry["created_at"] = datetime.now(timezone.utc).isoformat()
    CHECKINS.append(entry)
    return {"ok": True, "simulated": True, "checkin": entry}

@app.get("/api/checkins")
def list_checkins():
    return {"simulated": True, "items": CHECKINS}

@app.get("/api/health")
def health():
    return {"status": "ok", "demo_data": True}
