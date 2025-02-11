from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.quiz_model import QuizResult
from app.schemas.quiz_schema import QuizResultCreate, QuizResultResponse

quiz_router = APIRouter()

@quiz_router.post("/quiz-results/", response_model=QuizResultResponse)
def save_quiz_result(quiz_data: QuizResultCreate, db: Session = Depends(get_db)):
    new_result = QuizResult(**quiz_data.dict())

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return new_result
