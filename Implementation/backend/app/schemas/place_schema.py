from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

class PlaceCreate(BaseModel):
    name: str
    category: str
    latitude: float
    longitude: float
    rating: Optional[float]
    source_api: str
    cached_data: Optional[Dict]

class PlaceResponse(PlaceCreate):
    id: int
    created_at: datetime
    last_updated: datetime
    
    class Config:
        from_attributes=True
