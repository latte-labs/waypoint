from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.db import get_db
from app.models.user_model import User
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
    """
    ✅ Set default travel_style_id = 4 (Undefined) when creating a new user.
    """
    hashed_password = hash_password(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        status="active",
        travel_style_id=4  # ✅ Default to Undefined
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ✅ Get user details along with travel style
@user_router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    ✅ Fetch travel_style_id directly from User table instead of quiz_results.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "travel_style_id": user.travel_style_id  # ✅ No longer relying on quiz_results
    }

# ✅ Update user details, allowing travel_style_id updates
@user_router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.name = user_data.name
    db_user.email = user_data.email
    if user_data.password:
        db_user.password_hash = hash_password(user_data.password)

    # ✅ Allow updating travel_style_id
    if hasattr(user_data, "travel_style_id"):
        db_user.travel_style_id = user_data.travel_style_id

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

# ✅ Login endpoint now includes travel_style_id
@user_router.post("/auth/login")
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    ✅ Fetch travel_style_id directly from User table after login.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not pwd_context.verify(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    print(f"✅ User Logged In - ID: {user.id}, Email: {user.email}")

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "travel_style_id": user.travel_style_id  # ✅ No longer fetching from quiz_results
        }
    }
