from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models import user_model, itinerary_model, place_model, badge_model, quiz_model
from app.schemas import user_schema, itinerary_schema, place_schema, badge_schema, quiz_schema

# ========== PLACE ROUTES ==========
place_router = APIRouter()

@place_router.post("/places", response_model=place_schema.PlaceResponse)
def create_place(place: place_schema.PlaceCreate, db: Session = Depends(get_db)):
    db_place = place_model.Place(**place.dict())
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

@place_router.get("/places/{place_id}", response_model=place_schema.PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(place_model.Place).filter(place_model.Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place