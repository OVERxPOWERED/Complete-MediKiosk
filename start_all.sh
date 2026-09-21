#!/usr/bin/env bash

# ==============================================================================
# MediKiosk - Full Stack Startup Script (SIH 2026 - SIH26047)
# Starts:
#   1. Django Doctor Backend (Port 8000)
#   2. Doctor Workstation Frontend (Port 3000)
#   3. Kiosk Smart Station Frontend (Port 5173)
# ==============================================================================

set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$PROJECT_ROOT/logs"

echo "================================================================"
echo "          🏥 Starting Complete MediKiosk Ecosystem              "
echo "================================================================"

# Function to clean up all background processes on Ctrl+C or exit
cleanup() {
  echo ""
  echo "🛑 Shutting down all MediKiosk services..."
  kill $(jobs -p) 2>/dev/null || true
  wait 2>/dev/null || true
  echo "✔ All services stopped cleanly."
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 1. Start Django Doctor Backend (Port 8000)
# ------------------------------------------------------------------------------
echo "⚙️ [1/3] Starting Django Doctor Backend on http://localhost:8000..."
cd "$PROJECT_ROOT/doctor-backend"

if [ -f ".venv/bin/python" ]; then
  PYTHON_BIN=".venv/bin/python"
elif command -v python3 &>/dev/null; then
  PYTHON_BIN="python3"
else
  PYTHON_BIN="python"
fi

"$PYTHON_BIN" manage.py migrate --noinput > "$PROJECT_ROOT/logs/backend.log" 2>&1 || true
"$PYTHON_BIN" manage.py runserver 0.0.0.0:8000 > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!

# ------------------------------------------------------------------------------
# 2. Start Doctor Interface Next.js Frontend (Port 3000)
# ------------------------------------------------------------------------------
echo "🩺 [2/3] Starting Doctor Interface Workstation on http://localhost:3000..."
cd "$PROJECT_ROOT/doctor-interface"
npm run dev -- --port 3000 > "$PROJECT_ROOT/logs/doctor.log" 2>&1 &
DOCTOR_PID=$!

# ------------------------------------------------------------------------------
# 3. Start MediKiosk Patient Kiosk Vite Frontend (Port 5173)
# ------------------------------------------------------------------------------
echo "🖥️ [3/3] Starting MediKiosk Smart Station on http://localhost:5173..."
cd "$PROJECT_ROOT/kiosk_interface"
npm run dev > "$PROJECT_ROOT/logs/kiosk.log" 2>&1 &
KIOSK_PID=$!

sleep 3

echo ""
echo "================================================================"
echo "          🚀 All MediKiosk Services are Running Live!           "
echo "================================================================"
echo ""
echo "  🖥️  Patient Kiosk Station:    http://localhost:5173"
echo "  🩺  Doctor OPD Workstation:   http://localhost:3000"
echo "  🏥  Doctor Backend REST API:  http://localhost:8000/api/v1/"
echo ""
echo "  📁  Logs directory:           $PROJECT_ROOT/logs/"
echo "================================================================"
echo "  Press Ctrl+C anytime to stop all 3 services gracefully."
echo "================================================================"
echo ""

# Keep script running and wait for background jobs
wait
