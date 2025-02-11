from pydantic import BaseModel
from datetime import datetime
from typing import Dict

class APICacheResponse(BaseModel):
    id: int
    source: str
    data: Dict
    fetched_at: datetime
    
    class Config:
        orm_mode = True
