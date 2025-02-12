from pydantic import BaseModel
from typing import Optional

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    level: str
    
    class Config:
        from_attributes=True
