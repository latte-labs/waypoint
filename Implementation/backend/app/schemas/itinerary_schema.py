from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import List, Optional

# -------------------- Activity Schema --------------------

class ActivityBase(BaseModel):
    time: str
    name: str
    location: Optional[str] = None
    notes: Optional[str] = None
    estimated_cost: Optional[float] = None
    extra_data: Optional[dict] = None  # JSON field for extra data

class ActivityCreate(ActivityBase):
    itinerary_day_id: UUID

class ActivityResponse(ActivityBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------- Itinerary Day Schema --------------------

class ItineraryDayBase(BaseModel):
    date: datetime
    title: str

class ItineraryDayCreate(ItineraryDayBase):
    itinerary_id: UUID

class ItineraryDayResponse(ItineraryDayBase):
    id: UUID
    created_at: datetime
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True


# -------------------- Itinerary Schema --------------------

class ItineraryBase(BaseModel):
    name: str
    destination: str
    start_date: datetime
    end_date: datetime
    travel_style: Optional[str] = None
    budget: Optional[float] = None
    extra_data: Optional[dict] = None  # JSON field for future flexibility

class ItineraryCreate(ItineraryBase):
    created_by: UUID

class ItineraryResponse(ItineraryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    days: List[ItineraryDayResponse] = []

    class Config:
        from_attributes = True

class ItineraryDayUpdate(BaseModel):
    title: str
    date: datetime  # or datetime if you require a timestamp

    class Config:
        from_attributes = True

# -------------------- Itinerary Member Schema --------------------

class ItineraryMemberBase(BaseModel):
    itinerary_id: UUID
    user_id: UUID
    role: str  # Should be "Owner", "Editor", or "Viewer"

class ItineraryMemberCreate(ItineraryMemberBase):
    pass

class ItineraryMemberResponse(ItineraryMemberBase):
    id: UUID
    joined_at: datetime

    class Config:
        from_attributes = True

class ItinerarySchema(BaseModel):
    id: UUID
    name: str
    destination: str
    start_date: datetime
    end_date: datetime
    created_by: UUID
    budget: Optional[float] = None

    class Config:
        from_attributes = True

class ReorderDayItem(BaseModel):
    id: UUID
    order_index: int

class ReorderDaysRequest(BaseModel):
    days: List[ReorderDayItem]