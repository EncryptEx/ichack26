from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from .database import Base


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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)  # 0-100 scale
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sleep_sessions")


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
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[float]
    quality_score: Optional[float]
    
    class Config:
        from_attributes = True


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
