from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID  # ✅ Import UUID

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID  # ✅ Updated to UUID
    name: str
    email: EmailStr
    status: str
    travel_style_id: Optional[int]

    created_at: datetime
    
    class Config:
        from_attributes = True


class UpdateTravelStyle(BaseModel):
    travel_style_id: int  # ✅ Ensure it's an Integer