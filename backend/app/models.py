from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum


# ============= Enums =============

class WindowState(enum.Enum):
    STILL = "still"
    MOVING = "moving"
    AWAKE = "awake"
    OUT_OF_BED = "out_of_bed"


# ============= SQLAlchemy ORM Models (Database) =============

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sleep_sessions = relationship("SleepSession", back_populates="user", cascade="all, delete-orphan")
    dreams = relationship("DreamLog", back_populates="user", cascade="all, delete-orphan")


class SleepSession(Base):
    __tablename__ = "sleep_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_uuid = Column(String, unique=True, index=True, nullable=False)  # From RPi
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    sleep_onset_time = Column(DateTime, nullable=True)  # First 10min of stillness
    
    # Computed metrics
    duration_minutes = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)  # 0-100 scale
    points_earned = Column(Integer, nullable=True)  # Max 120
    
    # Movement metrics
    baseline_distance = Column(Float, nullable=True)
    awakenings_count = Column(Integer, default=0)
    restless_minutes = Column(Float, default=0)
    still_minutes = Column(Float, default=0)
    out_of_bed_minutes = Column(Float, default=0)
    
    # Stage estimates (movement-based, clearly marked as estimates)
    deep_estimate_minutes = Column(Float, nullable=True)
    rem_estimate_minutes = Column(Float, nullable=True)
    core_estimate_minutes = Column(Float, nullable=True)
    
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sleep_sessions")
    windows = relationship("SleepWindow", back_populates="session", cascade="all, delete-orphan")


class SleepWindow(Base):
    """30-second aggregated window from RPi."""
    __tablename__ = "sleep_windows"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sleep_sessions.id"), nullable=False)
    
    ts_start = Column(Float, nullable=False)  # Unix timestamp
    ts_end = Column(Float, nullable=False)
    avg_distance = Column(Float, nullable=False)
    movement_energy = Column(Float, nullable=False)
    active_ratio = Column(Float, nullable=False)
    state = Column(String, nullable=False)  # still, moving, awake, out_of_bed
    sample_count = Column(Integer, default=0)
    
    # Relationship
    session = relationship("SleepSession", back_populates="windows")


class DreamLog(Base):
    __tablename__ = "dream_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    mood = Column(String, nullable=True)  # happy, sad, neutral, scary, etc.
    
    # Relationships
    user = relationship("User", back_populates="dreams")


# ============= Pydantic Models (API Request/Response) =============

# Distance Sensor Models
class DistanceResponse(BaseModel):
    distance_cm: float
    is_laying_down: bool
    status: str


# User Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None


# Sleep Session Models
class SleepSessionBase(BaseModel):
    notes: Optional[str] = None


class SleepSessionCreate(SleepSessionBase):
    pass


class SleepSessionEnd(BaseModel):
    quality_score: Optional[float] = None
    notes: Optional[str] = None


class SleepSessionResponse(SleepSessionBase):
    id: int
    session_uuid: str
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    sleep_onset_time: Optional[datetime]
    duration_minutes: Optional[float]
    quality_score: Optional[float]
    points_earned: Optional[int]
    awakenings_count: int = 0
    restless_minutes: float = 0
    still_minutes: float = 0
    
    class Config:
        from_attributes = True


# RPi API Models (for device communication)
class RpiSessionStart(BaseModel):
    session_id: str
    user_id: int
    start_ts: float  # Unix timestamp
    baseline_distance: float


class RpiWindowData(BaseModel):
    session_id: str
    ts_start: float
    ts_end: float
    avg_distance: float
    movement_energy: float
    active_ratio: float
    state: str  # still, moving, awake, out_of_bed
    sample_count: int


class RpiWindowBatch(BaseModel):
    windows: List[RpiWindowData]


class RpiSessionEnd(BaseModel):
    session_id: str
    end_ts: float


class RpiHeartbeat(BaseModel):
    user_id: int
    session_id: Optional[str] = None
    timestamp: float
    is_online: bool = True
    buffer_size: int = 0


# Sleep Interval for frontend display
class SleepInterval(BaseModel):
    start: datetime
    end: datetime
    state: str  # sleeping, moving, awake


class SleepStageEstimates(BaseModel):
    """Movement-based estimates - NOT medical-grade."""
    deep_minutes: Optional[float] = None
    rem_minutes: Optional[float] = None
    core_minutes: Optional[float] = None
    disclaimer: str = "Estimated based on movement patterns only"


class SleepSummaryResponse(BaseModel):
    """Full sleep session summary for frontend."""
    session_id: str
    user_id: int
    
    # Times
    start_time: datetime
    end_time: Optional[datetime]
    sleep_onset_time: Optional[datetime]
    
    # Duration & Quality
    hours_slept: float
    sleep_quality: int  # 0-100
    
    # Points & Gamification
    points_earned: int
    points_delta_vs_yesterday: int
    rank_change: int  # Positive = moved up, negative = moved down
    current_rank: int
    
    # Movement metrics
    awakenings_count: int
    restless_minutes: float
    still_minutes: float
    out_of_bed_minutes: float
    
    # Stage estimates (movement-based)
    stages: SleepStageEstimates
    
    # Detailed intervals
    intervals: List[SleepInterval]


class DaySleepResponse(BaseModel):
    """Day-based sleep summary for frontend calendar view."""
    date: str  # YYYY-MM-DD format
    sessions: List[SleepSummaryResponse]
    
    # Daily aggregates
    total_hours_slept: float
    total_points_earned: int
    average_quality: int
    total_awakenings: int
    
    # Comparison
    points_delta_vs_yesterday: int
    current_rank: int


# Dream Log Models
class DreamLogBase(BaseModel):
    title: str
    content: str
    mood: Optional[str] = None


class DreamLogCreate(DreamLogBase):
    pass


class DreamLogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None


class DreamLogResponse(DreamLogBase):
    id: int
    user_id: int
    date: datetime
    
    class Config:
        from_attributes = True


class DayDreamsResponse(BaseModel):
    """Day-based dream log summary for frontend."""
    date: str  # YYYY-MM-DD format
    dreams: List[DreamLogResponse]
    total_entries: int


# Analytics Models
class AnalyticsOverview(BaseModel):
    total_sleep_hours: float
    average_sleep_duration: float
    total_sessions: int
    average_quality_score: Optional[float]
    best_sleep_duration: Optional[float]
    worst_sleep_duration: Optional[float]


class SleepTrend(BaseModel):
    date: str
    duration_minutes: float
    quality_score: Optional[float]


class AnalyticsTrends(BaseModel):
    trends: List[SleepTrend]


# Leaderboard Models
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    value: float
    label: str


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    user_rank: Optional[int] = None
    user_value: Optional[float] = None


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
