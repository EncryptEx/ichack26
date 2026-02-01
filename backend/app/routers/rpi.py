"""
RPi Device API Router

Handles communication from Raspberry Pi devices:
- Session start/end notifications
- Window data ingestion
- Heartbeat pings

These endpoints are called by the RPi client, not the frontend.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ..database import get_db
from ..models import (
    User, SleepSession, SleepWindow,
    RpiSessionStart, RpiSessionEnd, RpiWindowBatch, RpiHeartbeat
)
from ..sleep_computation import compute_sleep_metrics

router = APIRouter(prefix="/api/rpi", tags=["RPi Device API"])


@router.post("/sessions/start", status_code=status.HTTP_201_CREATED)
def rpi_start_session(
    data: RpiSessionStart,
    db: Session = Depends(get_db)
):
    """
    RPi notifies backend that a new sleep session has started.
    """
    # Verify user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {data.user_id} not found"
        )
    
    # Check for existing session with same UUID
    existing = db.query(SleepSession).filter(
        SleepSession.session_uuid == data.session_id
    ).first()
    if existing:
        # Idempotent - return success if already exists
        return {"status": "ok", "session_id": existing.id, "message": "Session already exists"}
    
    # Check for any unclosed sessions for this user
    active = db.query(SleepSession).filter(
        SleepSession.user_id == data.user_id,
        SleepSession.end_time.is_(None)
    ).first()
    if active:
        # Auto-close the previous session
        active.end_time = datetime.fromtimestamp(data.start_ts)
        db.commit()
    
    # Create new session
    session = SleepSession(
        session_uuid=data.session_id,
        user_id=data.user_id,
        start_time=datetime.fromtimestamp(data.start_ts),
        baseline_distance=data.baseline_distance
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "status": "ok",
        "session_id": session.id,
        "session_uuid": session.session_uuid
    }


@router.post("/sessions/windows")
def rpi_add_windows(
    data: RpiWindowBatch,
    db: Session = Depends(get_db)
):
    """
    RPi sends a batch of 30-second windows.
    """
    if not data.windows:
        return {"status": "ok", "windows_added": 0}
    
    # Group windows by session
    windows_by_session = {}
    for w in data.windows:
        if w.session_id not in windows_by_session:
            windows_by_session[w.session_id] = []
        windows_by_session[w.session_id].append(w)
    
    total_added = 0
    
    for session_uuid, windows in windows_by_session.items():
        # Find the session
        session = db.query(SleepSession).filter(
            SleepSession.session_uuid == session_uuid
        ).first()
        
        if not session:
            # Session not found - skip these windows
            continue
        
        # Add windows
        for w in windows:
            # Check for duplicate (same session + ts_start)
            existing = db.query(SleepWindow).filter(
                SleepWindow.session_id == session.id,
                SleepWindow.ts_start == w.ts_start
            ).first()
            
            if existing:
                continue
            
            window = SleepWindow(
                session_id=session.id,
                ts_start=w.ts_start,
                ts_end=w.ts_end,
                avg_distance=w.avg_distance,
                movement_energy=w.movement_energy,
                active_ratio=w.active_ratio,
                state=w.state,
                sample_count=w.sample_count
            )
            db.add(window)
            total_added += 1
    
    db.commit()
    
    return {"status": "ok", "windows_added": total_added}


@router.post("/sessions/end")
def rpi_end_session(
    data: RpiSessionEnd,
    db: Session = Depends(get_db)
):
    """
    RPi notifies backend that a sleep session has ended.
    Triggers computation of all metrics.
    """
    # Find the session
    session = db.query(SleepSession).filter(
        SleepSession.session_uuid == data.session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {data.session_id} not found"
        )
    
    if session.end_time is not None:
        # Already ended - return current state
        return {
            "status": "ok",
            "message": "Session already ended",
            "quality_score": session.quality_score,
            "points_earned": session.points_earned
        }
    
    # Set end time
    session.end_time = datetime.fromtimestamp(data.end_ts)
    
    # Get all windows for this session
    windows = db.query(SleepWindow).filter(
        SleepWindow.session_id == session.id
    ).order_by(SleepWindow.ts_start).all()
    
    # Convert to dict for computation
    window_dicts = [
        {
            "ts_start": w.ts_start,
            "ts_end": w.ts_end,
            "avg_distance": w.avg_distance,
            "movement_energy": w.movement_energy,
            "active_ratio": w.active_ratio,
            "state": w.state
        }
        for w in windows
    ]
    
    # Compute metrics
    metrics = compute_sleep_metrics(
        windows=window_dicts,
        session_start_ts=session.start_time.timestamp(),
        session_end_ts=data.end_ts
    )
    
    # Update session with computed values
    session.duration_minutes = metrics.total_minutes
    session.quality_score = metrics.quality_score
    session.points_earned = metrics.points_earned
    session.awakenings_count = metrics.awakenings_count
    session.restless_minutes = metrics.moving_minutes
    session.still_minutes = metrics.still_minutes
    session.out_of_bed_minutes = metrics.out_of_bed_minutes
    session.deep_estimate_minutes = metrics.deep_estimate_minutes
    session.rem_estimate_minutes = metrics.rem_estimate_minutes
    session.core_estimate_minutes = metrics.core_estimate_minutes
    
    # Calculate sleep onset time
    if metrics.sleep_onset_offset_minutes > 0:
        from datetime import timedelta
        session.sleep_onset_time = session.start_time + timedelta(
            minutes=metrics.sleep_onset_offset_minutes
        )
    else:
        session.sleep_onset_time = session.start_time
    
    db.commit()
    db.refresh(session)
    
    return {
        "status": "ok",
        "session_id": session.id,
        "duration_minutes": session.duration_minutes,
        "quality_score": session.quality_score,
        "points_earned": session.points_earned,
        "awakenings_count": session.awakenings_count
    }


@router.post("/heartbeat")
def rpi_heartbeat(
    data: RpiHeartbeat,
    db: Session = Depends(get_db)
):
    """
    RPi sends periodic heartbeat.
    Used for device health monitoring.
    """
    # For now, just acknowledge
    # Could store device status for monitoring dashboard
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "ack_session": data.session_id
    }
