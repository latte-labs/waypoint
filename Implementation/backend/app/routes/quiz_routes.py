from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models import user_model, itinerary_model, place_model, badge_model, quiz_model
from app.schemas import user_schema, itinerary_schema, place_schema, badge_schema, quiz_schema


# ========== QUIZ RESULT ROUTES ==========
quiz_router = APIRouter()

@quiz_router.post("/", response_model=quiz_schema.QuizResultResponse)
def create_or_update_quiz_result(
    quiz_result: quiz_schema.QuizResultCreate, db: Session = Depends(get_db)):
    # ✅ Check if the user already has a quiz result
    existing_result = db.query(quiz_model.QuizResult).filter(quiz_model.QuizResult.user_id == quiz_result.user_id).first()

    if existing_result:
        # ✅ Update the existing quiz result
        existing_result.travel_style = quiz_result.travel_style
        db.commit()
        db.refresh(existing_result)
        return existing_result  # ✅ Return updated result

    # ✅ If no existing result, create a new one
    db_quiz_result = quiz_model.QuizResult(**quiz_result.dict())
    db.add(db_quiz_result)
    db.commit()
    db.refresh(db_quiz_result)
    return db_quiz_result


@quiz_router.get("/{quiz_result_id}", response_model=quiz_schema.QuizResultResponse)
def get_quiz_result(quiz_result_id: int, db: Session = Depends(get_db)):
    quiz_result = db.query(quiz_model.QuizResult).filter(quiz_model.QuizResult.id == quiz_result_id).first()
    if not quiz_result:
        raise HTTPException(status_code=404, detail="Quiz result not found")
    return quiz_result
