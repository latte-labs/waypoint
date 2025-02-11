from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    status: str
    travel_style_id: Optional[int]
    created_at: datetime
    
    class Config:
        orm_mode = True
