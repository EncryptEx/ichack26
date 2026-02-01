import logging
import random
from typing import Optional

# Configuration
# Adjust these pins to match your wiring
TRIGGER_PIN = 23
ECHO_PIN = 24
# Helper constant for sleeping threshold (in cm)
# If distance is less than this, we assume someone is in bed
SLEEP_THRESHOLD_CM = 50.0

logger = logging.getLogger("hardware")

class SensorManager:
    def __init__(self):
        self.sensor = None
        self.is_mock = False
        try:
            from gpiozero import DistanceSensor

            # Checks if we are on a Pi or compatible environment
            # This might raise an exception if no GPIO factory is available
            self.sensor = DistanceSensor(
                trigger=TRIGGER_PIN, echo=ECHO_PIN, max_distance=2, queue_len=1
            )
            logger.info(f"Hardware initialized on TRIG={TRIGGER_PIN}, ECHO={ECHO_PIN}")

        except Exception as e:
            logger.warning(f"Could not initialize GPIO: {e}")
            logger.warning("Running in MOCK mode. Generating random values.")
            self.is_mock = True

    def get_distance(self) -> float:
        """
        Returns the distance in centimeters.
        """
        if self.is_mock:
            # Return a random float between 20.0 and 200.0 for testing
            return round(random.uniform(20.0, 150.0), 2)

        if self.sensor:
            # gpiozero returns distance in meters, convert to cm
            # multiply by 100
            dist_m = self.sensor.distance
            return round(dist_m * 100, 2)

        return 0.0

    def is_occupied(self, threshold_cm: float = SLEEP_THRESHOLD_CM) -> bool:
        """
        Returns True if the distance is less than the threshold.
        """
        distance = self.get_distance()
        # If distance is valid and less than threshold, someone is there
        # Note: Ultrasonic sensors sometimes return 0 or max value on error,
        # so you might need filtering in a real production env.
        return 0 < distance < threshold_cm


# Singleton instance
sensor_manager = SensorManager()
