from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.db import get_db  # ✅ Import get_db here

router = APIRouter()

@router.get("/users/test-db")
def test_db(db: Session = Depends(get_db)):
    result = db.execute("SELECT current_database();")
    return {"Connected to database": result.fetchone()[0]}
