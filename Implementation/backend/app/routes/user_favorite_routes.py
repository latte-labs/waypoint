from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.user_favorite_model import UserFavorite
from app.schemas.user_favorite_schema import UserFavoriteCreate, UserFavoriteResponse
from app.models.user_model import User
from app.models.place_model import Place
from datetime import datetime, timezone

# ========== USER FAVORITE ROUTES ==========
user_favorite_router = APIRouter()

@user_favorite_router.post("/", response_model=UserFavoriteResponse)
def add_favorite(favorite: UserFavoriteCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == favorite.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if place exists
    place = db.query(Place).filter(Place.id == favorite.place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    # Check if already favorited
    existing_favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == favorite.user_id,
        UserFavorite.place_id == favorite.place_id
    ).first()
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Place already in favorites")

    # Add to favorites
    db_favorite = UserFavorite(
        user_id=favorite.user_id,
        place_id=favorite.place_id,
        added_at=datetime.now(timezone.utc).replace(tzinfo=None)  # Ensure UTC storage
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

@user_favorite_router.get("/{user_id}", response_model=list[UserFavoriteResponse])
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    favorites = db.query(UserFavorite).filter(UserFavorite.user_id == user_id).all()
    return favorites

@user_favorite_router.delete("/{favorite_id}")
def remove_favorite(favorite_id: int, db: Session = Depends(get_db)):
    favorite = db.query(UserFavorite).filter(UserFavorite.id == favorite_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(favorite)
    db.commit()
    return {"message": "Favorite removed successfully"}
