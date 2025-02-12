from pydantic import BaseModel

class QuizResultCreate(BaseModel):
    user_id: int
    travel_style: str

class QuizResultResponse(QuizResultCreate):
    id: int

    class Config:
        from_attributes=True
