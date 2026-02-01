from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import (
    User, SleepSession, AnalyticsOverview, AnalyticsTrends, SleepTrend
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overall sleep statistics for the current user.
    """
    # Get all completed sleep sessions
    sessions = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.isnot(None)
    ).all()
    
    if not sessions:
        return AnalyticsOverview(
            total_sleep_hours=0.0,
            average_sleep_duration=0.0,
            total_sessions=0,
            average_quality_score=None,
            best_sleep_duration=None,
            worst_sleep_duration=None
        )
    
    # Calculate statistics
    total_minutes = sum(s.duration_minutes for s in sessions if s.duration_minutes)
    total_hours = total_minutes / 60
    average_duration = total_minutes / len(sessions) if sessions else 0
    
    # Quality scores
    quality_scores = [s.quality_score for s in sessions if s.quality_score is not None]
    avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else None
    
    # Best and worst sleep durations
    durations = [s.duration_minutes for s in sessions if s.duration_minutes]
    best_duration = max(durations) if durations else None
    worst_duration = min(durations) if durations else None
    
    return AnalyticsOverview(
        total_sleep_hours=round(total_hours, 2),
        average_sleep_duration=round(average_duration, 2),
        total_sessions=len(sessions),
        average_quality_score=round(avg_quality, 2) if avg_quality else None,
        best_sleep_duration=round(best_duration, 2) if best_duration else None,
        worst_sleep_duration=round(worst_duration, 2) if worst_duration else None
    )


@router.get("/trends", response_model=AnalyticsTrends)
def get_sleep_trends(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get sleep trends over the specified number of days.
    """
    # Calculate the cutoff date
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get sessions within the time range
    sessions = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.start_time >= cutoff_date,
        SleepSession.end_time.isnot(None)
    ).order_by(SleepSession.start_time).all()
    
    # Convert to trends
    trends = []
    for session in sessions:
        trends.append(SleepTrend(
            date=session.start_time.strftime("%Y-%m-%d"),
            duration_minutes=session.duration_minutes or 0.0,
            quality_score=session.quality_score
        ))
    
    return AnalyticsTrends(trends=trends)


@router.get("/quality", response_model=dict)
def get_quality_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed sleep quality metrics.
    """
    # Get all completed sessions with quality scores
    sessions = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.isnot(None),
        SleepSession.quality_score.isnot(None)
    ).all()
    
    if not sessions:
        return {
            "average_quality": None,
            "quality_distribution": {},
            "recent_quality_trend": []
        }
    
    # Calculate average quality
    quality_scores = [s.quality_score for s in sessions]
    avg_quality = sum(quality_scores) / len(quality_scores)
    
    # Quality distribution (grouped by ranges: 0-20, 21-40, 41-60, 61-80, 81-100)
    distribution = {
        "poor (0-20)": 0,
        "fair (21-40)": 0,
        "average (41-60)": 0,
        "good (61-80)": 0,
        "excellent (81-100)": 0
    }
    
    for score in quality_scores:
        if score <= 20:
            distribution["poor (0-20)"] += 1
        elif score <= 40:
            distribution["fair (21-40)"] += 1
        elif score <= 60:
            distribution["average (41-60)"] += 1
        elif score <= 80:
            distribution["good (61-80)"] += 1
        else:
            distribution["excellent (81-100)"] += 1
    
    # Recent quality trend (last 7 sessions)
    recent_sessions = sorted(sessions, key=lambda s: s.start_time, reverse=True)[:7]
    recent_trend = [
        {
            "date": s.start_time.strftime("%Y-%m-%d"),
            "quality_score": s.quality_score
        }
        for s in reversed(recent_sessions)
    ]
    
    return {
        "average_quality": round(avg_quality, 2),
        "quality_distribution": distribution,
        "recent_quality_trend": recent_trend
    }


@router.get("/streak", response_model=dict)
def get_sleep_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current sleep streak for the user.
    A streak is counted as consecutive days with at least one completed sleep session.
    """
    # Get all completed sessions ordered by date (most recent first)
    sessions = db.query(SleepSession).filter(
        SleepSession.user_id == current_user.id,
        SleepSession.end_time.isnot(None)
    ).order_by(SleepSession.start_time.desc()).all()
    
    if not sessions:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_sleep_date": None
        }
    
    # Get unique dates with sleep sessions (using the date of sleep start)
    sleep_dates = set()
    for session in sessions:
        # Use the date when the sleep session started
        sleep_dates.add(session.start_time.date())
    
    # Sort dates in descending order
    sorted_dates = sorted(sleep_dates, reverse=True)
    
    # Calculate current streak
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    current_streak = 0
    
    # Check if the most recent sleep was today or yesterday
    if sorted_dates and (sorted_dates[0] == today or sorted_dates[0] == yesterday):
        # Count consecutive days backwards from the most recent date
        expected_date = sorted_dates[0]
        for sleep_date in sorted_dates:
            if sleep_date == expected_date:
                current_streak += 1
                expected_date = expected_date - timedelta(days=1)
            elif sleep_date < expected_date:
                # Gap in dates, streak broken
                break
    
    # Calculate longest streak ever
    longest_streak = 0
    if sorted_dates:
        streak = 1
        sorted_dates_asc = sorted(sleep_dates)
        for i in range(1, len(sorted_dates_asc)):
            if sorted_dates_asc[i] - sorted_dates_asc[i-1] == timedelta(days=1):
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
        longest_streak = max(longest_streak, streak)
    
    last_sleep_date = sorted_dates[0].isoformat() if sorted_dates else None
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_sleep_date": last_sleep_date
    }
