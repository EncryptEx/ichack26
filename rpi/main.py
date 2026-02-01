#!/usr/bin/env python3
"""
Recharge Royale - RPi Sleep Tracker Main Entry Point

This script runs continuously on the Raspberry Pi, managing:
- Distance sensor sampling at 10 Hz
- Sleep session state machine
- Window aggregation and backend sync
"""
import logging
import time
import signal
import sys
import os
import subprocess
from datetime import datetime

import config
from sensor import sensor
from state_machine import SleepStateMachine, SessionState
from api_client import api_client

# Configure logging - use local file instead of /var/log
LOG_FILE = os.path.join(os.path.dirname(__file__), "recharge-royale.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE, mode="a")
    ]
)
logger = logging.getLogger("main")

# Global flag for graceful shutdown
running = True


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    global running
    logger.info(f"Received signal {signum}, shutting down...")
    running = False


def main():
    global running
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("=" * 60)
    logger.info("Recharge Royale - RPi Sleep Tracker")
    logger.info("=" * 60)
    logger.info(f"Sensor mode: {'MOCK' if sensor.is_mock else 'HARDWARE'}")
    logger.info(f"Backend URL: {config.BACKEND_URL}")
    logger.info(f"User ID: {config.USER_ID}")
    logger.info(f"Sample rate: {config.SAMPLE_RATE_HZ} Hz")
    logger.info(f"Window duration: {config.WINDOW_DURATION_SECONDS}s")
    logger.info("=" * 60)
    
    # Initialize state machine
    state_machine = SleepStateMachine(user_id=config.USER_ID)
    
    # Start OLED display subprocess
    oled_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "oled_display.py")
    logger.info(f"OLED script path: {oled_script}")
    oled_process = None
    try:
        oled_process = subprocess.Popen(
            [sys.executable, oled_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        logger.info(f"OLED display subprocess started (PID: {oled_process.pid})")
    except Exception as e:
        logger.warning(f"Failed to start OLED display subprocess: {e}")
    
    # Tracking variables
    last_sample_time = time.time()
    last_state = SessionState.IDLE
    session_reported = False
    
    logger.info("Starting main loop... Press Ctrl+C to stop.")
    
    while running:
        try:
            now = time.time()
            
            # Maintain sample rate
            elapsed = now - last_sample_time
            if elapsed < config.SAMPLE_INTERVAL:
                time.sleep(config.SAMPLE_INTERVAL - elapsed)
                continue
            
            last_sample_time = now
            
            # Process sensor sample
            window = state_machine.process_sample()
            current_state = state_machine.state
            
            # Log state transitions
            if current_state != last_state:
                logger.info(f"State transition: {last_state.name} → {current_state.name}")
                last_state = current_state
                
                # Report session start to backend
                if current_state == SessionState.IN_BED and not session_reported:
                    session = state_machine.get_session_data()
                    if session:
                        api_client.start_session(session)
                        session_reported = True
            
            # Send completed window to backend
            if window:
                api_client.add_window(window)
                logger.debug(
                    f"Window: state={window.state}, active={window.active_ratio:.1%}, "
                    f"energy={window.movement_energy:.6f}"
                )
            
            # Handle session end
            if current_state == SessionState.ENDED:
                session = state_machine.get_session_data()
                if session:
                    api_client.end_session(session, now)
                    logger.info(
                        f"Session ended: {session.session_id}, "
                        f"windows={len(session.windows)}"
                    )
                
                # Reset for next session
                state_machine.reset()
                session_reported = False
            
            # Periodic heartbeat
            api_client.send_heartbeat()
            
            # Periodic status (every 60 seconds in IDLE, every 5 min otherwise)
            if current_state == SessionState.IDLE:
                if int(now) % 60 == 0:
                    distance = sensor.get_filtered_distance()
                    logger.info(f"[IDLE] Distance: {distance:.2f}m, waiting for person...")
            
        except Exception as e:
            logger.exception(f"Error in main loop: {e}")
            time.sleep(1)  # Prevent tight error loop
    
    # Graceful shutdown
    logger.info("Shutting down...")
    
    # Stop OLED display subprocess
    if oled_process and oled_process.poll() is None:
        logger.info("Stopping OLED display subprocess...")
        oled_process.terminate()
        try:
            oled_process.wait(timeout=2.0)
        except subprocess.TimeoutExpired:
            oled_process.kill()
    
    # End any active session
    if state_machine.state not in (SessionState.IDLE, SessionState.ENDED):
        session = state_machine.get_session_data()
        if session:
            logger.info("Ending active session due to shutdown...")
            api_client.end_session(session, time.time())
    
    # Flush remaining data
    api_client.flush_windows()
    
    logger.info("Goodbye!")


if __name__ == "__main__":
    main()
