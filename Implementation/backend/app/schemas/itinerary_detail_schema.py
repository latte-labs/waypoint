from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID
from typing import List, Optional

class ItineraryDetailCreate(BaseModel):
    itinerary_id: int
    place_id: int
    visit_date: Optional[datetime]

class ItineraryDetailResponse(ItineraryDetailCreate):
    id: int
    
    class Config:
        from_attributes=True

class ActivitySchema(BaseModel):
    id: UUID
    time: str
    name: str
    location: Optional[str] = None

class ItineraryDaySchema(BaseModel):
    id: UUID
    date: datetime
    title: str
    activities: List[ActivitySchema]  # ✅ Nesting activities under each day

class ItineraryDetailResponseSchema(BaseModel):
    id: UUID
    name: str
    destination: str
    start_date: datetime
    end_date: datetime
    created_by: UUID
    updated_at: datetime  # new field added
    budget: Optional[float] = None
    days: List[ItineraryDaySchema]  # ✅ Correctly nested days & activities

    class Config:
        from_attributes = True
