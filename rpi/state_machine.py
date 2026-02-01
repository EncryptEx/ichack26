"""
Sleep Session State Machine

Manages the lifecycle of a sleep session:
- IDLE: No one in bed
- CALIBRATING: Person just detected, calibrating noise floor
- IN_BED: Person in bed, tracking sleep
- ENDING: Person appears to have left, waiting for debounce
- ENDED: Session complete
"""
import logging
import time
import uuid
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import Optional, List
from statistics import median, mean
from collections import deque

import config
from sensor import sensor

logger = logging.getLogger("state_machine")


class SessionState(Enum):
    IDLE = auto()
    CALIBRATING = auto()
    IN_BED = auto()
    ENDING = auto()
    ENDED = auto()


class WindowState(Enum):
    STILL = "still"
    MOVING = "moving"
    AWAKE = "awake"
    OUT_OF_BED = "out_of_bed"


@dataclass
class SleepWindow:
    """30-second aggregated sleep window data."""
    session_id: str
    ts_start: float  # Unix timestamp
    ts_end: float
    avg_distance: float
    movement_energy: float
    active_ratio: float
    state: str
    sample_count: int


@dataclass
class SessionData:
    """Active session tracking data."""
    session_id: str
    user_id: int
    start_ts: float
    baseline_distance: float
    noise_floor: float = 0.01
    movement_threshold: float = 0.05
    windows: List[SleepWindow] = field(default_factory=list)


class SleepStateMachine:
    """
    Manages sleep detection and tracking state machine.
    """
    
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.state = SessionState.IDLE
        self.session: Optional[SessionData] = None
        
        # Debounce tracking
        self._in_bed_start_ts: Optional[float] = None
        self._out_of_bed_start_ts: Optional[float] = None
        
        # Calibration data
        self._calibration_samples: List[float] = []
        self._calibration_start_ts: Optional[float] = None
        
        # Current window data
        self._window_start_ts: Optional[float] = None
        self._window_samples: List[float] = []  # Filtered distances
        self._window_movements: List[float] = []  # Movement magnitudes
        
        # Previous distance for delta calculation
        self._prev_distance: Optional[float] = None
    
    def process_sample(self) -> Optional[SleepWindow]:
        """
        Process a single sensor sample and return a window if completed.
        
        Call this at SAMPLE_RATE_HZ frequency.
        Returns a SleepWindow when a 30s window is complete.
        """
        now = time.time()
        distance = sensor.get_filtered_distance()
        
        # Calculate movement (velocity)
        movement = 0.0
        if self._prev_distance is not None:
            movement = abs(distance - self._prev_distance)
        self._prev_distance = distance
        
        # State machine transitions
        if self.state == SessionState.IDLE:
            return self._handle_idle(distance, now)
        
        elif self.state == SessionState.CALIBRATING:
            return self._handle_calibrating(distance, movement, now)
        
        elif self.state == SessionState.IN_BED:
            return self._handle_in_bed(distance, movement, now)
        
        elif self.state == SessionState.ENDING:
            return self._handle_ending(distance, movement, now)
        
        return None
    
    def _handle_idle(self, distance: float, now: float) -> None:
        """Handle IDLE state - waiting for person to get in bed."""
        if distance < config.IN_BED_THRESHOLD_M:
            if self._in_bed_start_ts is None:
                self._in_bed_start_ts = now
                logger.debug(f"Person detected at {distance:.2f}m, starting debounce")
            
            # Check debounce
            elapsed = now - self._in_bed_start_ts
            if elapsed >= config.IN_BED_DEBOUNCE_SECONDS:
                logger.info(f"Person confirmed in bed after {elapsed:.1f}s debounce")
                self._start_calibration(distance, now)
        else:
            # Reset debounce if person leaves
            if self._in_bed_start_ts is not None:
                logger.debug("Person left during debounce, resetting")
            self._in_bed_start_ts = None
        
        return None
    
    def _handle_calibrating(self, distance: float, movement: float, now: float) -> None:
        """Handle CALIBRATING state - measuring noise floor."""
        self._calibration_samples.append(movement)
        
        elapsed = now - self._calibration_start_ts
        if elapsed >= config.CALIBRATION_DURATION_SECONDS:
            self._finish_calibration(distance, now)
        
        return None
    
    def _handle_in_bed(self, distance: float, movement: float, now: float) -> Optional[SleepWindow]:
        """Handle IN_BED state - actively tracking sleep."""
        # Check for out-of-bed condition
        if distance > config.OUT_OF_BED_THRESHOLD_M:
            if self._out_of_bed_start_ts is None:
                self._out_of_bed_start_ts = now
                logger.debug(f"Person might be leaving at {distance:.2f}m")
            
            elapsed = now - self._out_of_bed_start_ts
            if elapsed >= config.OUT_OF_BED_DEBOUNCE_SECONDS:
                logger.info("Person confirmed out of bed")
                self.state = SessionState.ENDING
                return self._finalize_current_window(now, is_out_of_bed=True)
        else:
            self._out_of_bed_start_ts = None
        
        # Collect window samples
        self._window_samples.append(distance)
        self._window_movements.append(movement)
        
        # Check if window is complete
        elapsed = now - self._window_start_ts
        if elapsed >= config.WINDOW_DURATION_SECONDS:
            return self._finalize_current_window(now)
        
        return None
    
    def _handle_ending(self, distance: float, movement: float, now: float) -> Optional[SleepWindow]:
        """Handle ENDING state - session is ending."""
        # Return final window if any remaining samples
        window = None
        if self._window_samples:
            window = self._finalize_current_window(now, is_out_of_bed=True)
        
        self.state = SessionState.ENDED
        return window
    
    def _start_calibration(self, distance: float, now: float):
        """Begin calibration phase for noise floor measurement."""
        self.session = SessionData(
            session_id=str(uuid.uuid4()),
            user_id=self.user_id,
            start_ts=now,
            baseline_distance=distance
        )
        self.state = SessionState.CALIBRATING
        self._calibration_start_ts = now
        self._calibration_samples = []
        logger.info(f"Starting calibration for session {self.session.session_id}")
    
    def _finish_calibration(self, distance: float, now: float):
        """Finish calibration and start actual sleep tracking."""
        if self._calibration_samples:
            # Use median of movement samples as noise floor
            self.session.noise_floor = median(self._calibration_samples)
            self.session.movement_threshold = (
                self.session.noise_floor * config.MOVEMENT_THRESHOLD_MULTIPLIER
            )
            logger.info(
                f"Calibration complete: noise_floor={self.session.noise_floor:.6f}, "
                f"threshold={self.session.movement_threshold:.6f}"
            )
        
        # Start first window
        self.state = SessionState.IN_BED
        self._window_start_ts = now
        self._window_samples = []
        self._window_movements = []
        self._out_of_bed_start_ts = None
    
    def _finalize_current_window(self, now: float, is_out_of_bed: bool = False) -> Optional[SleepWindow]:
        """Complete current window and prepare for next."""
        if not self._window_samples or not self.session:
            return None
        
        # Calculate window metrics
        avg_distance = mean(self._window_samples)
        movement_energy = mean(self._window_movements) if self._window_movements else 0.0
        
        # Calculate active ratio (samples where movement > threshold)
        threshold = self.session.movement_threshold
        active_count = sum(1 for m in self._window_movements if m > threshold)
        active_ratio = active_count / len(self._window_movements) if self._window_movements else 0.0
        
        # Classify window state
        if is_out_of_bed or avg_distance > config.OUT_OF_BED_THRESHOLD_M:
            state = WindowState.OUT_OF_BED
        elif active_ratio >= config.MOVING_THRESHOLD:
            state = WindowState.AWAKE
        elif active_ratio >= config.STILL_THRESHOLD:
            state = WindowState.MOVING
        else:
            state = WindowState.STILL
        
        window = SleepWindow(
            session_id=self.session.session_id,
            ts_start=self._window_start_ts,
            ts_end=now,
            avg_distance=round(avg_distance, 4),
            movement_energy=round(movement_energy, 6),
            active_ratio=round(active_ratio, 4),
            state=state.value,
            sample_count=len(self._window_samples)
        )
        
        self.session.windows.append(window)
        logger.debug(
            f"Window complete: state={state.value}, active_ratio={active_ratio:.2%}, "
            f"energy={movement_energy:.6f}"
        )
        
        # Reset for next window
        self._window_start_ts = now
        self._window_samples = []
        self._window_movements = []
        
        return window
    
    def get_session_data(self) -> Optional[SessionData]:
        """Get current session data."""
        return self.session
    
    def reset(self):
        """Reset state machine to IDLE."""
        self.state = SessionState.IDLE
        self.session = None
        self._in_bed_start_ts = None
        self._out_of_bed_start_ts = None
        self._calibration_samples = []
        self._calibration_start_ts = None
        self._window_start_ts = None
        self._window_samples = []
        self._window_movements = []
        self._prev_distance = None
        logger.info("State machine reset to IDLE")
