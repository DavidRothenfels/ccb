#!/bin/bash

# CityChallenge PocketBase Stop Script
# This script cleanly stops all PocketBase processes

echo "========================================"
echo "CityChallenge - Stopping PocketBase"
echo "========================================"

PORT=8091

# Function to stop PocketBase processes
stop_pocketbase() {
    echo "Looking for PocketBase processes..."
    
    # Find all PocketBase processes
    PIDS=$(pgrep -f "pocketbase" || true)
    
    if [ -n "$PIDS" ]; then
        echo "Found PocketBase processes: $PIDS"
        
        # Try graceful shutdown first
        echo "Sending termination signal..."
        for PID in $PIDS; do
            kill $PID 2>/dev/null || true
        done
        
        # Wait for graceful shutdown
        echo "Waiting for processes to terminate..."
        sleep 3
        
        # Check if still running
        PIDS=$(pgrep -f "pocketbase" || true)
        if [ -n "$PIDS" ]; then
            echo "Some processes still running, force terminating..."
            for PID in $PIDS; do
                kill -9 $PID 2>/dev/null || true
            done
            sleep 1
        fi
        
        echo "✓ All PocketBase processes stopped"
    else
        echo "✓ No PocketBase processes found"
    fi
    
    # Also check for processes using the port
    if lsof -i:$PORT >/dev/null 2>&1; then
        echo ""
        echo "Something is still using port $PORT:"
        lsof -i:$PORT
        echo ""
        echo "Attempting to free the port..."
        fuser -k $PORT/tcp 2>/dev/null || true
        sleep 1
        
        if lsof -i:$PORT >/dev/null 2>&1; then
            echo "⚠️  WARNING: Could not free port $PORT"
        else
            echo "✓ Port $PORT is now free"
        fi
    else
        echo "✓ Port $PORT is free"
    fi
}

# Main execution
stop_pocketbase

echo ""
echo "========================================"
echo "PocketBase stopped successfully"
echo "========================================"