from pydantic import BaseModel

class DistanceResponse(BaseModel):
    distance_cm: float
    is_laying_down: bool
    status: str
