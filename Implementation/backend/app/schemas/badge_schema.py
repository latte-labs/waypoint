from pydantic import BaseModel
from typing import Optional
from uuid import UUID  # ✅ Import UUID

class BadgeResponse(BaseModel):
    id: UUID  # ✅ Updated to UUID
    name: str
    description: Optional[str]
    image_url: Optional[str]
    level: str
    
    class Config:
        from_attributes = True
