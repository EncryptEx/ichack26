"""
Configuration for RPi Sleep Tracker Client
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ============= Hardware Configuration =============
TRIGGER_PIN = int(os.getenv("TRIGGER_PIN", "23"))
ECHO_PIN = int(os.getenv("ECHO_PIN", "24"))

# ============= Sampling Configuration =============
SAMPLE_RATE_HZ = 10  # Samples per second (5-10 Hz recommended)
SAMPLE_INTERVAL = 1.0 / SAMPLE_RATE_HZ

# ============= Window Configuration =============
WINDOW_DURATION_SECONDS = 5  # Aggregate samples into 30s windows

# ============= Detection Thresholds =============
# Distance thresholds (in meters)
IN_BED_THRESHOLD_M = 0.5      # < 1m = person in bed
OUT_OF_BED_THRESHOLD_M = 1.0  # > 1.2m with hysteresis = out of bed

# Debounce times
IN_BED_DEBOUNCE_SECONDS = 5   # Must be < threshold for N seconds to start session
OUT_OF_BED_DEBOUNCE_SECONDS = 5  # Must be > threshold for M seconds to end session (2 min)

# ============= Movement Detection =============
MOVEMENT_THRESHOLD_MULTIPLIER = 5.0  # threshold = noise_floor * this value
CALIBRATION_DURATION_SECONDS = 5   # 5 seconds calibration at start
MEDIAN_FILTER_WINDOW = 5
EMA_ALPHA = 0.3  # Exponential Moving Average smoothing factor

# ============= State Classification =============
# Active ratio thresholds for 30s windows
STILL_THRESHOLD = 0.05      # < 5% active = sleeping/still
MOVING_THRESHOLD = 0.25     # 5-25% = moving, >= 25% = awake-ish

# ============= Backend Configuration =============
BACKEND_URL = os.getenv("BACKEND_URL", "http://thinkpad.local:8000")
DEVICE_TOKEN = os.getenv("DEVICE_TOKEN", "")  # Device auth token
USER_ID = int(os.getenv("USER_ID", "1"))

# ============= Network Configuration =============
WINDOW_BATCH_SIZE = 10  # Send N windows at once
HEARTBEAT_INTERVAL_SECONDS = 300  # 5 minutes
REQUEST_TIMEOUT_SECONDS = 10
MAX_RETRY_ATTEMPTS = 3
RETRY_DELAY_SECONDS = 5

# ============= Offline Buffer =============
MAX_BUFFERED_WINDOWS = 1000  # Store up to this many windows if offline
