from pydantic import BaseModel
from datetime import datetime
from uuid import UUID  # ✅ Import UUID

class UserFavoriteCreate(BaseModel):
    user_id: UUID  # ✅ Updated to UUID
    place_id: UUID  # ✅ Updated to UUID

class UserFavoriteResponse(UserFavoriteCreate):
    id: UUID  # ✅ Updated to UUID
    added_at: datetime
    
    class Config:
        from_attributes = True
