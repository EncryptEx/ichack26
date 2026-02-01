from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..database import get_db
from ..models import (
    User, SleepSession, SleepSessionCreate, SleepSessionResponse,
    SleepSessionEnd, SleepWindow, SleepSummaryResponse, SleepInterval,
    SleepStageEstimates
)
from ..auth import get_current_user
from ..sleep_computation import generate_intervals

router = APIRouter(prefix="/api/sleep", tags=["Sleep Tracking"])


@router.post("/start", response_model=SleepSessionResponse, status_code=status.HTTP_201_CREATED)
def start_sleep_session(
    session_data: SleepSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new sleep session for the current user.
    """
    # Check if there's already an active session
    active_session = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.is_(None)
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active sleep session. End it first."
        )
    
    # Create new sleep session
    new_session = SleepSession(
        user_id=current_user.id,
        start_time=datetime.utcnow(),
        notes=session_data.notes
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return new_session


@router.post("/end", response_model=SleepSessionResponse)
def end_sleep_session(
    end_data: SleepSessionEnd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    End the current active sleep session.
    """
    # Find the active session
    active_session = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.is_(None)
    ).first()
    
    if not active_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active sleep session found"
        )
    
    # Update the session
    end_time = datetime.utcnow()
    active_session.end_time = end_time
    
    # Calculate duration in minutes
    duration = (end_time - active_session.start_time).total_seconds() / 60
    active_session.duration_minutes = duration
    
    if end_data.quality_score is not None:
        active_session.quality_score = end_data.quality_score
    
    if end_data.notes:
        active_session.notes = end_data.notes
    
    db.commit()
    db.refresh(active_session)
    
    return active_session


@router.get("/sessions", response_model=List[SleepSessionResponse])
def get_sleep_sessions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all sleep sessions for the current user.
    """
    sessions = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id
    ).order_by(SleepSession.start_time.desc()).offset(skip).limit(limit).all()
    
    return sessions


@router.get("/current", response_model=Optional[SleepSessionResponse])
def get_current_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current active sleep session if one exists.
    """
    active_session = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.is_(None)
    ).first()
    
    return active_session


@router.get("/latest/summary", response_model=SleepSummaryResponse)
def get_latest_session_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the full summary of the latest completed sleep session.
    Includes all metrics, intervals, and stage estimates.
    """
    # Get latest completed session
    session = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.isnot(None)
    ).order_by(SleepSession.end_time.desc()).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No completed sleep sessions found"
        )
    
    return _build_session_summary(session, current_user, db)


@router.get("/sessions/{session_uuid}/summary", response_model=SleepSummaryResponse)
def get_session_summary(
    session_uuid: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the full summary of a specific sleep session.
    """
    session = db.query(SleepSession).filter(
        SleepSession.session_uuid == session_uuid,
        SleepSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return _build_session_summary(session, current_user, db)


def _build_session_summary(
    session: SleepSession,
    current_user: User,
    db: Session
) -> SleepSummaryResponse:
    """
    Build a complete session summary response.
    """
    # Get windows for intervals
    windows = db.query(SleepWindow).filter(
        SleepWindow.session_id == session.id
    ).order_by(SleepWindow.ts_start).all()
    
    window_dicts = [
        {
            "ts_start": w.ts_start,
            "ts_end": w.ts_end,
            "state": w.state
        }
        for w in windows
    ]
    
    # Generate merged intervals
    intervals_raw = generate_intervals(window_dicts)
    intervals = [
        SleepInterval(
            start=i["start"],
            end=i["end"],
            state=i["state"]
        )
        for i in intervals_raw
    ]
    
    # Calculate deltas vs yesterday
    points_delta, rank_change, current_rank = _calculate_deltas(
        user_id=current_user.id,
        session_date=session.start_time.date(),
        db=db
    )
    
    # Build stage estimates
    stages = SleepStageEstimates(
        deep_minutes=session.deep_estimate_minutes,
        rem_minutes=session.rem_estimate_minutes,
        core_minutes=session.core_estimate_minutes
    )
    
    return SleepSummaryResponse(
        session_id=session.session_uuid,
        user_id=session.user_id,
        start_time=session.start_time,
        end_time=session.end_time,
        sleep_onset_time=session.sleep_onset_time,
        hours_slept=round((session.duration_minutes or 0) / 60, 2),
        sleep_quality=int(session.quality_score or 0),
        points_earned=session.points_earned or 0,
        points_delta_vs_yesterday=points_delta,
        rank_change=rank_change,
        current_rank=current_rank,
        awakenings_count=session.awakenings_count or 0,
        restless_minutes=session.restless_minutes or 0,
        still_minutes=session.still_minutes or 0,
        out_of_bed_minutes=session.out_of_bed_minutes or 0,
        stages=stages,
        intervals=intervals
    )


def _calculate_deltas(user_id: int, session_date, db: Session):
    """
    Calculate points delta vs yesterday and rank change.
    """
    from datetime import timedelta
    from sqlalchemy import func
    
    yesterday = session_date - timedelta(days=1)
    
    # Get today's total points
    today_points = db.query(func.sum(SleepSession.points_earned)).filter(
        SleepSession.user_id == user_id,
        func.date(SleepSession.start_time) == session_date
    ).scalar() or 0
    
    # Get yesterday's total points
    yesterday_points = db.query(func.sum(SleepSession.points_earned)).filter(
        SleepSession.user_id == user_id,
        func.date(SleepSession.start_time) == yesterday
    ).scalar() or 0
    
    points_delta = today_points - yesterday_points
    
    # Calculate current rank (by total points)
    # Get all users' total points
    user_totals = db.query(
        SleepSession.user_id,
        func.sum(SleepSession.points_earned).label("total")
    ).group_by(SleepSession.user_id).order_by(
        func.sum(SleepSession.points_earned).desc()
    ).all()
    
    current_rank = 1
    for i, (uid, _) in enumerate(user_totals, 1):
        if uid == user_id:
            current_rank = i
            break
    
    # For rank change, we'd need historical data
    # For now, return 0 (no change) as placeholder
    rank_change = 0
    
    return points_delta, rank_change, current_rank
