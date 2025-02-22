from pydantic import BaseModel

class QuizResultCreate(BaseModel):
    user_id: int
    travel_style: str

class QuizResultResponse(QuizResultCreate):
    id: int

    class Config:
        from_attributes = True

# ✅ New schema for updating quiz result (only requires travel_style)
class QuizResultUpdate(BaseModel):
    travel_style: str
