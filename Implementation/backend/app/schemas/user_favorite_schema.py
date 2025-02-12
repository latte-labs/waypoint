from pydantic import BaseModel
from datetime import datetime

class UserFavoriteCreate(BaseModel):
    user_id: int
    place_id: int

class UserFavoriteResponse(UserFavoriteCreate):
    id: int
    added_at: datetime
    
    class Config:
        from_attributes=True
