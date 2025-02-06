from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.user_model import User

user_router = APIRouter()

@user_router.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
