# ASTRAHEALTH AI

A student-buildable, offline-friendly astronaut health monitoring prototype based on the uploaded NASA Space Apps presentation.

## Stack
- Frontend: React + Vite + Recharts
- Backend: Python FastAPI
- Demo data: simulated only (not real medical or spacecraft telemetry)

## Features
- Crew health dashboard: heart rate, SpO₂, sleep and stress
- Mission environment: CO₂, temperature, humidity and radiation
- Seven-day trend chart
- Explainable rule-based alerts with acknowledgement
- Daily mood / wellbeing check-in
- Baseline comparison and data freshness labels

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs at http://127.0.0.1:8000. API docs: http://127.0.0.1:8000/docs

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually http://localhost:5173).

## Important safety note
This is a hackathon demonstration using simulated values and illustrative thresholds. It does not diagnose, treat, or provide medical advice. Do not use it for real astronaut or patient monitoring. Any real deployment requires medically reviewed limits, validated datasets, hardware integration, cybersecurity review and aerospace medical approval.
