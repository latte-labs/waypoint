from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models import user_model, place_model, badge_model, quiz_model
from app.schemas import user_schema, itinerary_schema, place_schema, badge_schema, quiz_schema

# ========== BADGE ROUTES ==========
badge_router = APIRouter()

@badge_router.post("/", response_model=badge_schema.BadgeResponse)
def create_badge(badge: badge_schema.BadgeResponse, db: Session = Depends(get_db)):
    db_badge = badge_model.Badge(**badge.dict())
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

@badge_router.get("/{badge_id}", response_model=badge_schema.BadgeResponse)
def get_badge(badge_id: int, db: Session = Depends(get_db)):
    badge = db.query(badge_model.Badge).filter(badge_model.Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    return badge