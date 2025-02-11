from pydantic import BaseModel
from datetime import datetime

class SharedItineraryCreate(BaseModel):
    itinerary_id: int
    user_id: int
    role: str

class SharedItineraryResponse(SharedItineraryCreate):
    id: int
    added_at: datetime
    
    class Config:
        orm_mode = True
