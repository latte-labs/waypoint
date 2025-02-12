from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ItineraryDetailCreate(BaseModel):
    itinerary_id: int
    place_id: int
    visit_date: Optional[datetime]

class ItineraryDetailResponse(ItineraryDetailCreate):
    id: int
    
    class Config:
        from_attributes=True
