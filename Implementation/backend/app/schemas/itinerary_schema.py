from pydantic import BaseModel
from datetime import datetime

class ItineraryCreate(BaseModel):
    user_id: int
    name: str

class ItineraryResponse(ItineraryCreate):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
