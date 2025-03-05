from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.db import get_db
from app.models.user_model import User
from app.models.travel_style_model import TravelStyle  # ✅ Ensure this model exists
from app.schemas.user_schema import UserCreate, UserResponse

user_router = APIRouter()

# ✅ Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

@user_router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    ✅ Set default travel_style_id = 4 (Undefined) when creating a new user.
    """
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=user.password,  # Ensure password is hashed before storing
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

# ✅ NEW: Get user's travel style details
@user_router.get("/{user_id}/travel_style")
def get_user_travel_style(user_id: int, db: Session = Depends(get_db)):
    """
    ✅ Fetch full travel style details using travel_style_id from the users table.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    travel_style = db.query(TravelStyle).filter(TravelStyle.id == user.travel_style_id).first()
    if not travel_style:
        raise HTTPException(status_code=404, detail="Travel style not found")

    return {
        "id": travel_style.id,
        "name": travel_style.name,
        "description": travel_style.description
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
        db_user.password_hash = user_data.password  # Ensure password is hashed before storing

    # ✅ Validate travel_style_id before updating
    if hasattr(user_data, "travel_style_id"):
        travel_style = db.query(TravelStyle).filter(TravelStyle.id == user_data.travel_style_id).first()
        if not travel_style:
            raise HTTPException(status_code=400, detail="Invalid travel style ID")
        db_user.travel_style_id = user_data.travel_style_id

    db.commit()
    db.refresh(db_user)
    return db_user

# ✅ Login now returns travel_style_id
@user_router.post("/auth/login")
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    ✅ Fetch travel_style_id directly from User table after login.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "travel_style_id": user.travel_style_id  # ✅ No longer fetching from quiz_results
        }
    }

# ✅ Define a new model to accept only `travel_style_id`
class UpdateTravelStyle(BaseModel):
    travel_style_id: int

@user_router.put("/{user_id}/travel_style")
def update_user_travel_style(user_id: int, data: UpdateTravelStyle, db: Session = Depends(get_db)):
    """
    ✅ Updates only `travel_style_id` for a user.
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Validate `travel_style_id` before updating
    travel_style = db.query(TravelStyle).filter(TravelStyle.id == data.travel_style_id).first()
    if not travel_style:
        raise HTTPException(status_code=400, detail="Invalid travel style ID")

    db_user.travel_style_id = data.travel_style_id
    db.commit()
    db.refresh(db_user)

    # ✅ Explicitly return a proper JSON response
    return {
        "message": "Travel style updated successfully",
        "user_id": user_id,
        "travel_style_id": db_user.travel_style_id,
        "travel_style_name": travel_style.name,
        "travel_style_description": travel_style.description
    }
