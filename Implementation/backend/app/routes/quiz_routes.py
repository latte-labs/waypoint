from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models import quiz_model
from app.schemas import quiz_schema

quiz_router = APIRouter()

# ✅ Create or update quiz result
@quiz_router.post("/", response_model=quiz_schema.QuizResultResponse)
def create_or_update_quiz_result(quiz_result: quiz_schema.QuizResultCreate, db: Session = Depends(get_db)):
    existing_result = db.query(quiz_model.QuizResult).filter(quiz_model.QuizResult.user_id == quiz_result.user_id).first()

    if existing_result:
        existing_result.travel_style = quiz_result.travel_style
        db.commit()
        db.refresh(existing_result)
        return existing_result  

    db_quiz_result = quiz_model.QuizResult(**quiz_result.dict())
    db.add(db_quiz_result)
    db.commit()
    db.refresh(db_quiz_result)
    return db_quiz_result

# ✅ Retrieve quiz result based on user_id
@quiz_router.get("/user/{user_id}", response_model=quiz_schema.QuizResultResponse)
def get_quiz_result_by_user_id(user_id: int, db: Session = Depends(get_db)):
    quiz_result = db.query(quiz_model.QuizResult).filter(quiz_model.QuizResult.user_id == user_id).first()
    if not quiz_result:
        raise HTTPException(status_code=404, detail="Quiz result not found")
    return quiz_result

# ✅ Update quiz result for a user (Using `QuizResultUpdate`)
@quiz_router.put("/user/{user_id}")
def update_quiz_result(user_id: int, quiz_update: quiz_schema.QuizResultUpdate, db: Session = Depends(get_db)):
    quiz_result = db.query(quiz_model.QuizResult).filter(quiz_model.QuizResult.user_id == user_id).first()

    if not quiz_result:
        raise HTTPException(status_code=404, detail="Quiz result not found")

    quiz_result.travel_style = quiz_update.travel_style
    db.commit()
    db.refresh(quiz_result)
    return {"message": "Travel style updated successfully"}
