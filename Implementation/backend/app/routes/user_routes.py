from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.db import get_db
from app.models.user_model import User
from app.models.quiz_model import QuizResult  # ✅ Import quiz result model
from app.schemas.user_schema import UserCreate, UserResponse

user_router = APIRouter()

# ✅ Set up password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

# ✅ Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

@user_router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        status="active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ✅ Get user details along with travel style
@user_router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Fetch user's travel style from QuizResult
    quiz_result = db.query(QuizResult).filter(QuizResult.user_id == user_id).first()
    travel_style = quiz_result.travel_style if quiz_result else "Not set"

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "travel_style": travel_style
    }

# ✅ Update user details
@user_router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.name = user_data.name
    db_user.email = user_data.email
    if user_data.password:
        db_user.password_hash = hash_password(user_data.password)

    db.commit()
    db.refresh(db_user)
    return db_user

# ✅ Delete user
@user_router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# ✅ Login endpoint now includes travel style
@user_router.post("/auth/login")
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    ✅ This function now fetches and returns the user's travel style after login.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not pwd_context.verify(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    print(f"✅ User Logged In - ID: {user.id}, Email: {user.email}")

    # ✅ Fetch travel style from QuizResult table
    quiz_result = db.query(QuizResult).filter(QuizResult.user_id == user.id).first()
    travel_style = quiz_result.travel_style if quiz_result else "Not set"

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "travel_style": travel_style  # ✅ Travel style included in response
        }
    }
