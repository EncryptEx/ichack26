from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import (
    User, DreamLog, DreamLogCreate, DreamLogResponse, DreamLogUpdate
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
