from fastapi import FastAPI
from .hardware import sensor_manager, SLEEP_THRESHOLD_CM
from .models import DistanceResponse

app = FastAPI(
    title="Recharge Royale - Smart Pillow API",
    description="API for detecting sleep schedule via ultrasonic sensor",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Recharge Royale API. Visit /docs for swagger UI."}

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
