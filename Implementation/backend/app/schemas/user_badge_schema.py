from pydantic import BaseModel
from datetime import datetime

class UserBadgeResponse(BaseModel):
    id: int
    user_id: int
    badge_id: int
    unlocked_at: datetime
    
    class Config:
        from_attributes=True
