from pydantic import BaseModel
from datetime import datetime
from uuid import UUID  # ✅ Import UUID

class UserBadgeResponse(BaseModel):
    id: UUID  # ✅ Updated to UUID
    user_id: UUID  # ✅ Updated to UUID
    badge_id: UUID  # ✅ Updated to UUID
    unlocked_at: datetime
    
    class Config:
        from_attributes = True
