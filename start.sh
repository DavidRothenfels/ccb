#!/bin/bash

# CityChallenge PocketBase Start Script
# This script ensures clean startup of PocketBase with Windows accessibility

echo "========================================"
echo "CityChallenge - Starting PocketBase"
echo "========================================"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Configuration
PORT=8091
HOST="0.0.0.0"  # Bind to all interfaces for Windows accessibility

# Function to kill existing PocketBase processes
kill_existing_pocketbase() {
    echo "Checking for existing PocketBase processes..."
    
    # Find all PocketBase processes
    PIDS=$(pgrep -f "pocketbase.*$PORT" || true)
    
    if [ -n "$PIDS" ]; then
        echo "Found existing PocketBase processes: $PIDS"
        echo "Terminating..."
        
        # Try graceful shutdown first
        for PID in $PIDS; do
            kill $PID 2>/dev/null || true
        done
        
        # Wait a moment
        sleep 2
        
        # Force kill if still running
        PIDS=$(pgrep -f "pocketbase.*$PORT" || true)
        if [ -n "$PIDS" ]; then
            echo "Force terminating stubborn processes..."
            for PID in $PIDS; do
                kill -9 $PID 2>/dev/null || true
            done
        fi
        
        echo "✓ Existing processes terminated"
    else
        echo "✓ No existing PocketBase processes found"
    fi
}

# Function to check if port is in use
check_port() {
    if lsof -i:$PORT >/dev/null 2>&1; then
        echo "⚠️  Port $PORT is in use. Checking what's using it..."
        lsof -i:$PORT
        return 1
    else
        echo "✓ Port $PORT is available"
        return 0
    fi
}

# Function to get WSL IP address
get_wsl_ip() {
    # Get the WSL2 IP address
    WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -1)
    echo "$WSL_IP"
}

# Main execution
echo ""
echo "1. Cleaning up existing processes..."
kill_existing_pocketbase

echo ""
echo "2. Checking port availability..."
if ! check_port; then
    echo "Attempting to free port $PORT..."
    fuser -k $PORT/tcp 2>/dev/null || true
    sleep 1
    if ! check_port; then
        echo "❌ ERROR: Could not free port $PORT"
        echo "Please manually stop the process using this port and try again."
        exit 1
    fi
fi

echo ""
echo "3. Starting PocketBase..."
echo "----------------------------------------"

# Check if pocketbase executable exists
if [ ! -f "./pocketbase" ]; then
    echo "❌ ERROR: PocketBase executable not found!"
    echo "Please ensure pocketbase is in: $SCRIPT_DIR"
    exit 1
fi

# Make sure it's executable
chmod +x ./pocketbase

# Get WSL IP for display
WSL_IP=$(get_wsl_ip)

# Start PocketBase with proper configuration
echo "Starting PocketBase on http://$HOST:$PORT"
echo ""
echo "Access points:"
echo "  From WSL:     http://localhost:$PORT/"
echo "  From Windows: http://localhost:$PORT/"
echo "  Network:      http://$WSL_IP:$PORT/"
echo ""
echo "Admin panel:"
echo "  http://localhost:$PORT/_/"
echo ""
echo "API endpoint:"
echo "  http://localhost:$PORT/api/"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start PocketBase
# Using exec to replace the shell process with PocketBase
exec ./pocketbase serve \
    --http="$HOST:$PORT" \
    --dir=./pb_data \
    --publicDir=./pb_public \
    --migrationsDir=./pb_migrations