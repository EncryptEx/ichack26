from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .hardware import sensor_manager, SLEEP_THRESHOLD_CM
from .models import DistanceResponse
from .database import init_db

# Import routers
from .routers import users, sleep, dreams, analytics, leaderboard, rpi

app = FastAPI(
    title="Recharge Royale - Smart Pillow API",
    description="API for detecting sleep schedule via ultrasonic sensor",
    version="2.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Include routers
app.include_router(users.router)
app.include_router(sleep.router)
app.include_router(dreams.router)
app.include_router(analytics.router)
app.include_router(leaderboard.router)
app.include_router(rpi.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Recharge Royale API. Visit /docs for swagger UI.",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "distance": "/distance",
            "users": "/api/users",
            "sleep": "/api/sleep",
            "dreams": "/api/dreams",
            "analytics": "/api/analytics",
            "leaderboard": "/api/leaderboard",
            "rpi": "/api/rpi"
        }
    }

@app.get("/distance", response_model=DistanceResponse)
def get_current_distance():
    """
    Get the current sensor reading in cm and determine if someone is in bed.
    """
    distance = sensor_manager.get_distance()
    is_laying = sensor_manager.is_occupied(SLEEP_THRESHOLD_CM)
    
    status_msg = "Person Detected" if is_laying else "Bed Empty"
    
    return DistanceResponse(
        distance_cm=distance,
        is_laying_down=is_laying,
        status=status_msg
    )

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "mode": "MOCK" if sensor_manager.is_mock else "HARDWARE"
    }
