from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..database import get_db
from ..models import (
    User, SleepSession, SleepSessionCreate, SleepSessionResponse,
    SleepSessionEnd
)
from ..auth import get_current_user

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
