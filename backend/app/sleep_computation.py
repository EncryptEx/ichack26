"""
Sleep Quality, Points, and Stage Estimation Computation

All calculations are based on movement patterns from the ultrasonic sensor.
Stage estimates are clearly NOT medical-grade.
"""
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class SleepMetrics:
    """Computed sleep metrics from window data."""
    total_minutes: float
    still_minutes: float
    moving_minutes: float
    awake_minutes: float
    out_of_bed_minutes: float
    awakenings_count: int
    sleep_onset_offset_minutes: float  # Time from start until first 10min of stillness
    quality_score: int  # 0-100
    points_earned: int  # 0-120
    deep_estimate_minutes: float
    rem_estimate_minutes: float
    core_estimate_minutes: float


def compute_sleep_metrics(
    windows: List[dict],  # List of window dicts with state, ts_start, ts_end, movement_energy
    session_start_ts: float,
    session_end_ts: float
) -> SleepMetrics:
    """
    Compute all sleep metrics from window data.
    
    Args:
        windows: List of window dictionaries from database
        session_start_ts: Session start Unix timestamp
        session_end_ts: Session end Unix timestamp
    
    Returns:
        SleepMetrics with all computed values
    """
    if not windows:
        return SleepMetrics(
            total_minutes=0, still_minutes=0, moving_minutes=0,
            awake_minutes=0, out_of_bed_minutes=0, awakenings_count=0,
            sleep_onset_offset_minutes=0, quality_score=0, points_earned=0,
            deep_estimate_minutes=0, rem_estimate_minutes=0, core_estimate_minutes=0
        )
    
    # Categorize windows
    still_minutes = 0.0
    moving_minutes = 0.0
    awake_minutes = 0.0
    out_of_bed_minutes = 0.0
    
    for w in windows:
        duration = (w["ts_end"] - w["ts_start"]) / 60.0  # Convert to minutes
        state = w.get("state", "still")
        
        if state == "still":
            still_minutes += duration
        elif state == "moving":
            moving_minutes += duration
        elif state == "awake":
            awake_minutes += duration
        elif state == "out_of_bed":
            out_of_bed_minutes += duration
    
    total_minutes = (session_end_ts - session_start_ts) / 60.0
    in_bed_minutes = total_minutes - out_of_bed_minutes
    
    # Count awakenings (transitions into awake state lasting >= 1 minute)
    awakenings_count = _count_awakenings(windows)
    
    # Calculate sleep onset (first 10 consecutive minutes of stillness)
    sleep_onset_offset = _calculate_sleep_onset(windows, session_start_ts)
    
    # Calculate quality score
    quality_score = _calculate_quality_score(
        total_minutes=in_bed_minutes,
        still_minutes=still_minutes,
        moving_minutes=moving_minutes,
        awake_minutes=awake_minutes,
        out_of_bed_minutes=out_of_bed_minutes,
        awakenings_count=awakenings_count
    )
    
    # Calculate points
    points_earned = _calculate_points(
        hours_slept=in_bed_minutes / 60.0,
        quality_score=quality_score
    )
    
    # Estimate sleep stages (movement-based heuristic only)
    deep_est, rem_est, core_est = _estimate_sleep_stages(windows, still_minutes)
    
    return SleepMetrics(
        total_minutes=round(total_minutes, 1),
        still_minutes=round(still_minutes, 1),
        moving_minutes=round(moving_minutes, 1),
        awake_minutes=round(awake_minutes, 1),
        out_of_bed_minutes=round(out_of_bed_minutes, 1),
        awakenings_count=awakenings_count,
        sleep_onset_offset_minutes=round(sleep_onset_offset, 1),
        quality_score=quality_score,
        points_earned=points_earned,
        deep_estimate_minutes=round(deep_est, 1),
        rem_estimate_minutes=round(rem_est, 1),
        core_estimate_minutes=round(core_est, 1)
    )


def _count_awakenings(windows: List[dict]) -> int:
    """
    Count awakenings: transitions into awake state lasting >= 1 minute.
    """
    awakenings = 0
    in_awakening = False
    awakening_duration = 0.0
    
    for w in windows:
        state = w.get("state", "still")
        duration = (w["ts_end"] - w["ts_start"]) / 60.0
        
        if state in ("awake", "out_of_bed"):
            if not in_awakening:
                in_awakening = True
                awakening_duration = duration
            else:
                awakening_duration += duration
        else:
            if in_awakening and awakening_duration >= 1.0:
                awakenings += 1
            in_awakening = False
            awakening_duration = 0.0
    
    # Count final awakening if session ended while awake
    if in_awakening and awakening_duration >= 1.0:
        awakenings += 1
    
    return awakenings


def _calculate_sleep_onset(windows: List[dict], session_start_ts: float) -> float:
    """
    Find sleep onset: first point where there's 10 consecutive minutes of stillness.
    Returns offset in minutes from session start.
    """
    ONSET_THRESHOLD_MINUTES = 10.0
    
    consecutive_still = 0.0
    onset_start_ts = None
    
    for w in windows:
        state = w.get("state", "still")
        duration = (w["ts_end"] - w["ts_start"]) / 60.0
        
        if state == "still":
            if onset_start_ts is None:
                onset_start_ts = w["ts_start"]
            consecutive_still += duration
            
            if consecutive_still >= ONSET_THRESHOLD_MINUTES:
                return (onset_start_ts - session_start_ts) / 60.0
        else:
            consecutive_still = 0.0
            onset_start_ts = None
    
    # If we never found 10 min of stillness, return 0 (use session start)
    return 0.0


def _calculate_quality_score(
    total_minutes: float,
    still_minutes: float,
    moving_minutes: float,
    awake_minutes: float,
    out_of_bed_minutes: float,
    awakenings_count: int
) -> int:
    """
    Calculate sleep quality score (0-100).
    
    Formula:
        score = 100
        score -= 70 * restless_ratio
        score -= 1.5 * awake_minutes
        score -= 4 * awakenings
        score -= 0.5 * out_of_bed_minutes
        clamp 0..100
    """
    if total_minutes <= 0:
        return 0
    
    restless_ratio = moving_minutes / total_minutes if total_minutes > 0 else 0
    
    score = 100.0
    score -= 70 * restless_ratio
    score -= 1.5 * awake_minutes
    score -= 4 * awakenings_count
    score -= 0.5 * out_of_bed_minutes
    
    return max(0, min(100, int(round(score))))


def _calculate_points(hours_slept: float, quality_score: int) -> int:
    """
    Calculate points earned for the night (max 120).
    
    Formula:
        duration_points = min(60, 60 * (hours_slept / 8.0))
        quality_points = 60 * (quality_score / 100)
        total = round(duration_points + quality_points)
        clamp 0..120
    """
    duration_points = min(60, 60 * (hours_slept / 8.0))
    quality_points = 60 * (quality_score / 100)
    
    total = round(duration_points + quality_points)
    return max(0, min(120, total))


def _estimate_sleep_stages(
    windows: List[dict],
    total_still_minutes: float
) -> Tuple[float, float, float]:
    """
    Estimate sleep stages based on movement patterns.
    
    THIS IS A ROUGH HEURISTIC, NOT MEDICAL-GRADE.
    
    - Deep: Long periods of very low movement energy
    - REM: Still baseline with occasional micro-movements
    - Core: Everything else that's asleep
    
    Returns: (deep_minutes, rem_minutes, core_minutes)
    """
    if total_still_minutes <= 0:
        return (0.0, 0.0, 0.0)
    
    # Analyze movement energy distribution in still windows
    still_windows = [w for w in windows if w.get("state") == "still"]
    
    if not still_windows:
        return (0.0, 0.0, 0.0)
    
    # Sort by movement energy
    energies = [w.get("movement_energy", 0) for w in still_windows]
    if not energies:
        return (0.0, 0.0, 0.0)
    
    avg_energy = sum(energies) / len(energies)
    
    deep_minutes = 0.0
    rem_minutes = 0.0
    core_minutes = 0.0
    
    for w in still_windows:
        duration = (w["ts_end"] - w["ts_start"]) / 60.0
        energy = w.get("movement_energy", 0)
        
        # Very low energy = deep sleep estimate
        if energy < avg_energy * 0.5:
            deep_minutes += duration
        # Slightly higher with small bursts = REM estimate
        elif energy < avg_energy * 1.2:
            rem_minutes += duration
        # Normal still = core sleep
        else:
            core_minutes += duration
    
    return (deep_minutes, rem_minutes, core_minutes)


def generate_intervals(windows: List[dict]) -> List[dict]:
    """
    Generate merged intervals from windows for frontend display.
    Consecutive windows with the same state are merged.
    
    Returns: List of {start: datetime, end: datetime, state: str}
    """
    if not windows:
        return []
    
    # Map internal states to display states
    state_map = {
        "still": "sleeping",
        "moving": "moving",
        "awake": "awake",
        "out_of_bed": "awake"
    }
    
    intervals = []
    current_state = None
    current_start = None
    current_end = None
    
    for w in sorted(windows, key=lambda x: x["ts_start"]):
        display_state = state_map.get(w.get("state", "still"), "sleeping")
        
        if display_state == current_state:
            # Extend current interval
            current_end = w["ts_end"]
        else:
            # Save previous interval
            if current_state is not None:
                intervals.append({
                    "start": datetime.fromtimestamp(current_start),
                    "end": datetime.fromtimestamp(current_end),
                    "state": current_state
                })
            
            # Start new interval
            current_state = display_state
            current_start = w["ts_start"]
            current_end = w["ts_end"]
    
    # Save final interval
    if current_state is not None:
        intervals.append({
            "start": datetime.fromtimestamp(current_start),
            "end": datetime.fromtimestamp(current_end),
            "state": current_state
        })
    
    return intervals
