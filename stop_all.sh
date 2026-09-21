#!/usr/bin/env bash

# ==============================================================================
# MediKiosk - Stop All Running Services Script
# Kills any active processes on ports 8000, 3000, and 5173
# ==============================================================================

echo "🛑 Stopping MediKiosk processes..."

# Kill by port
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# Kill by process name pattern
pkill -f "manage.py runserver" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "✔ All MediKiosk services (Ports 8000, 3000, 5173) have been stopped."
