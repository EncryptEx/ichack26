from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import (
    User, SleepSession, LeaderboardResponse, LeaderboardEntry
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])


@router.get("/sleep-hours", response_model=LeaderboardResponse)
def get_sleep_hours_leaderboard(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard ranked by total sleep hours.
    """
    # Get total sleep hours for each user
    leaderboard_data = db.query(
        User.id,
        User.username,
        func.sum(SleepSession.duration_minutes).label('total_minutes')
    ).join(
        SleepSession, User.id == SleepSession.user_id
    ).filter(
        SleepSession.end_time.isnot(None)
    ).group_by(
        User.id, User.username
    ).order_by(
        func.sum(SleepSession.duration_minutes).desc()
    ).limit(limit).all()
    
    # Convert to leaderboard entries
    entries = []
    user_rank = None
    user_value = None
    
    for rank, (user_id, username, total_minutes) in enumerate(leaderboard_data, start=1):
        total_hours = total_minutes / 60 if total_minutes else 0
        entries.append(LeaderboardEntry(
            rank=rank,
            username=username,
            value=round(total_hours, 2),
            label=f"{round(total_hours, 1)}h"
        ))
        
        if user_id == current_user.id:
            user_rank = rank
            user_value = round(total_hours, 2)
    
    # If current user is not in top entries, find their rank
    if user_rank is None:
        user_stats = db.query(
            func.sum(SleepSession.duration_minutes)
        ).filter(
            SleepSession.user_id == current_user.id,
            SleepSession.end_time.isnot(None)
        ).scalar()
        
        if user_stats:
            user_value = round(user_stats / 60, 2)
            # Find rank by counting users with more sleep hours using a subquery
            from sqlalchemy import select
            user_totals = select(
                SleepSession.user_id,
                func.sum(SleepSession.duration_minutes).label('total')
            ).where(
                SleepSession.end_time.isnot(None)
            ).group_by(
                SleepSession.user_id
            ).having(
                func.sum(SleepSession.duration_minutes) > user_stats
            ).alias()
            
            users_above = db.query(func.count()).select_from(user_totals).scalar() or 0
            user_rank = users_above + 1
    
    return LeaderboardResponse(
        entries=entries,
        user_rank=user_rank,
        user_value=user_value
    )


@router.get("/consistency", response_model=LeaderboardResponse)
def get_consistency_leaderboard(
    limit: int = 10,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard ranked by sleep consistency (number of sessions in recent days).
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get session count for each user in the specified period
    leaderboard_data = db.query(
        User.id,
        User.username,
        func.count(SleepSession.id).label('session_count')
    ).join(
        SleepSession, User.id == SleepSession.user_id
    ).filter(
        SleepSession.start_time >= cutoff_date,
        SleepSession.end_time.isnot(None)
    ).group_by(
        User.id, User.username
    ).order_by(
        func.count(SleepSession.id).desc()
    ).limit(limit).all()
    
    # Convert to leaderboard entries
    entries = []
    user_rank = None
    user_value = None
    
    for rank, (user_id, username, session_count) in enumerate(leaderboard_data, start=1):
        entries.append(LeaderboardEntry(
            rank=rank,
            username=username,
            value=float(session_count),
            label=f"{session_count} sessions"
        ))
        
        if user_id == current_user.id:
            user_rank = rank
            user_value = float(session_count)
    
    # If current user is not in top entries, find their stats
    if user_rank is None:
        user_stats = db.query(
            func.count(SleepSession.id)
        ).filter(
            SleepSession.user_id == current_user.id,
            SleepSession.start_time >= cutoff_date,
            SleepSession.end_time.isnot(None)
        ).scalar()
        
        if user_stats:
            user_value = float(user_stats)
    
    return LeaderboardResponse(
        entries=entries,
        user_rank=user_rank,
        user_value=user_value
    )


@router.get("/quality", response_model=LeaderboardResponse)
def get_quality_leaderboard(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard ranked by average sleep quality score.
    """
    # Get average quality score for each user
    leaderboard_data = db.query(
        User.id,
        User.username,
        func.avg(SleepSession.quality_score).label('avg_quality')
    ).join(
        SleepSession, User.id == SleepSession.user_id
    ).filter(
        SleepSession.end_time.isnot(None),
        SleepSession.quality_score.isnot(None)
    ).group_by(
        User.id, User.username
    ).order_by(
        func.avg(SleepSession.quality_score).desc()
    ).limit(limit).all()
    
    # Convert to leaderboard entries
    entries = []
    user_rank = None
    user_value = None
    
    for rank, (user_id, username, avg_quality) in enumerate(leaderboard_data, start=1):
        quality_score = avg_quality if avg_quality else 0
        entries.append(LeaderboardEntry(
            rank=rank,
            username=username,
            value=round(quality_score, 2),
            label=f"{round(quality_score, 1)}/100"
        ))
        
        if user_id == current_user.id:
            user_rank = rank
            user_value = round(quality_score, 2)
    
    # If current user is not in top entries, find their stats
    if user_rank is None:
        user_stats = db.query(
            func.avg(SleepSession.quality_score)
        ).filter(
            SleepSession.user_id == current_user.id,
            SleepSession.end_time.isnot(None),
            SleepSession.quality_score.isnot(None)
        ).scalar()
        
        if user_stats:
            user_value = round(user_stats, 2)
    
    return LeaderboardResponse(
        entries=entries,
        user_rank=user_rank,
        user_value=user_value
    )
