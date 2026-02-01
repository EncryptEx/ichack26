"""
Ultrasonic Distance Sensor Handler with Filtering

Supports HC-SR04 / JSN-SR04T sensors via gpiozero.
Includes median filtering and EMA smoothing.
Falls back to mock mode if not running on Raspberry Pi.
"""
import logging
import random
import time
from collections import deque
from typing import Optional
from statistics import median

import config

logger = logging.getLogger("sensor")


class DistanceSensor:
    """
    Manages ultrasonic distance sensor with filtering.
    """
    
    def __init__(self):
        self._sensor = None
        self._is_mock = False
        self._raw_buffer: deque = deque(maxlen=config.MEDIAN_FILTER_WINDOW)
        self._ema_value: Optional[float] = None
        
        try:
            from gpiozero import DistanceSensor as GpioDistanceSensor
            self._sensor = GpioDistanceSensor(
                echo=config.ECHO_PIN,
                trigger=config.TRIGGER_PIN,
                max_distance=4.0  # Max 4 meters
            )
            logger.info(
                f"Ultrasonic sensor initialized on TRIG={config.TRIGGER_PIN}, "
                f"ECHO={config.ECHO_PIN}"
            )
        except Exception as e:
            logger.warning(f"Could not initialize GPIO: {e}")
            logger.warning("Running in MOCK mode with simulated distance values.")
            self._is_mock = True
            self._mock_state = "empty"
            self._mock_base = 2.5
    
    @property
    def is_mock(self) -> bool:
        return self._is_mock
    
    def get_raw_distance(self) -> float:
        """
        Get raw distance reading in meters.
        """
        if self._is_mock:
            return self._get_mock_distance()
        
        if self._sensor:
            return self._sensor.distance
        
        return 0.0
    
    def get_filtered_distance(self) -> float:
        """
        Get filtered distance (median + EMA smoothed) in meters.
        
        1. Raw reading
        2. Median filter (removes spikes)
        3. EMA smoothing (reduces noise)
        """
        raw = self.get_raw_distance()
        self._raw_buffer.append(raw)
        
        # Apply median filter
        if len(self._raw_buffer) >= 3:
            median_val = median(self._raw_buffer)
        else:
            median_val = raw
        
        # Apply EMA smoothing
        if self._ema_value is None:
            self._ema_value = median_val
        else:
            alpha = config.EMA_ALPHA
            self._ema_value = alpha * median_val + (1 - alpha) * self._ema_value
        
        return self._ema_value
    
    def _get_mock_distance(self) -> float:
        """
        Generate simulated distance for testing.
        Simulates person in bed with occasional movements.
        """
        # Randomly change state occasionally
        if random.random() < 0.001:  # 0.1% chance per sample
            self._mock_state = random.choice(["empty", "in_bed", "moving", "awake"])
            if self._mock_state == "empty":
                self._mock_base = random.uniform(1.5, 3.0)
            elif self._mock_state == "in_bed":
                self._mock_base = random.uniform(0.4, 0.8)
            elif self._mock_state == "moving":
                self._mock_base = random.uniform(0.5, 0.9)
            elif self._mock_state == "awake":
                self._mock_base = random.uniform(0.6, 1.1)
        
        # Add noise based on state
        if self._mock_state == "empty":
            noise = random.gauss(0, 0.02)
        elif self._mock_state == "in_bed":
            noise = random.gauss(0, 0.005)  # Very stable
        elif self._mock_state == "moving":
            noise = random.gauss(0, 0.03)  # More movement
        else:  # awake
            noise = random.gauss(0, 0.05)
        
        return max(0.02, self._mock_base + noise)


# Singleton instance
sensor = DistanceSensor()
