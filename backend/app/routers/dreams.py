from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from ..database import get_db
from ..models import (
    User, DreamLog, DreamLogCreate, DreamLogResponse, DreamLogUpdate,
    DayDreamsResponse, DreamLogWithUserResponse
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/dreams", tags=["Dream Log"])


@router.post("/", response_model=DreamLogResponse, status_code=status.HTTP_201_CREATED)
def create_dream_entry(
    dream: DreamLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new dream log entry.
    """
    new_dream = DreamLog(
        user_id=current_user.id,
        title=dream.title,
        content=dream.content,
        mood=dream.mood
    )
    db.add(new_dream)
    db.commit()
    db.refresh(new_dream)
    
    return new_dream


@router.get("/feed", response_model=List[DreamLogWithUserResponse])
def get_dreams_feed(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recent dreams from all users (social feed).
    Returns dreams with username information.
    """
    # Query dreams with user join to get username
    dreams = db.query(DreamLog, User.username).join(
        User, DreamLog.user_id == User.id
    ).order_by(DreamLog.date.desc()).offset(skip).limit(limit).all()
    
    # Transform to response format
    result = []
    for dream, username in dreams:
        result.append(DreamLogWithUserResponse(
            id=dream.id,
            user_id=dream.user_id,
            title=dream.title,
            content=dream.content,
            mood=dream.mood,
            date=dream.date,
            username=username if dream.user_id != current_user.id else "You"
        ))
    
    return result


@router.get("/", response_model=List[DreamLogResponse])
def get_dream_entries(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all dream log entries for the current user.
    """
    dreams = db.query(DreamLog).filter(
        DreamLog.user_id == current_user.id
    ).order_by(DreamLog.date.desc()).offset(skip).limit(limit).all()
    
    return dreams


@router.get("/{dream_id}", response_model=DreamLogResponse)
def get_dream_entry(
    dream_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific dream log entry.
    """
    dream = db.query(DreamLog).filter(
        DreamLog.id == dream_id,
        DreamLog.user_id == current_user.id
    ).first()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream entry not found"
        )
    
    return dream


@router.put("/{dream_id}", response_model=DreamLogResponse)
def update_dream_entry(
    dream_id: int,
    dream_update: DreamLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a dream log entry.
    """
    dream = db.query(DreamLog).filter(
        DreamLog.id == dream_id,
        DreamLog.user_id == current_user.id
    ).first()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream entry not found"
        )
    
    if dream_update.title is not None:
        dream.title = dream_update.title
    if dream_update.content is not None:
        dream.content = dream_update.content
    if dream_update.mood is not None:
        dream.mood = dream_update.mood
    
    db.commit()
    db.refresh(dream)
    
    return dream


@router.delete("/{dream_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dream_entry(
    dream_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a dream log entry.
    """
    dream = db.query(DreamLog).filter(
        DreamLog.id == dream_id,
        DreamLog.user_id == current_user.id
    ).first()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream entry not found"
        )
    
    db.delete(dream)
    db.commit()
    
    return None


@router.get("/day/{day_date}", response_model=DayDreamsResponse)
def get_dreams_by_day(
    day_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all dream entries for a specific day (YYYY-MM-DD format).
    """
    from sqlalchemy import func
    
    try:
        target_date = datetime.strptime(day_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    dreams = db.query(DreamLog).filter(
        func.date(DreamLog.date) == target_date
    ).order_by(DreamLog.date).all()
    
    return DayDreamsResponse(
        date=day_date,
        dreams=dreams,
        total_entries=len(dreams)
    )


@router.get("/days", response_model=List[DayDreamsResponse])
def get_dreams_by_date_range(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dream entries for a date range. Returns a list of daily summaries.
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    if end < start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )
    
    if (end - start).days > 31:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date range cannot exceed 31 days"
        )
    
    results = []
    current_date = start
    
    while current_date <= end:
        day_str = current_date.strftime("%Y-%m-%d")
        day_response = get_dreams_by_day(day_str, current_user, db)
        results.append(day_response)
        current_date += timedelta(days=1)
    
    return results
