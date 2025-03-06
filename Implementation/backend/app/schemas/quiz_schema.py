from pydantic import BaseModel
from uuid import UUID  # ✅ Import UUID

class QuizResultCreate(BaseModel):
    user_id: UUID  # ✅ Updated to UUID
    travel_style: str

class QuizResultResponse(QuizResultCreate):
    id: UUID  # ✅ Updated to UUID

    class Config:
        from_attributes = True

# ✅ Schema for updating quiz result (only requires travel_style)
class QuizResultUpdate(BaseModel):
    travel_style: str
