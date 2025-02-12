from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.place_model import Place
from app.schemas.place_schema import PlaceCreate, PlaceResponse
from datetime import datetime, timezone


# ========== PLACE ROUTES ==========
place_router = APIRouter()

@place_router.post("/", response_model=PlaceResponse)
def create_place(place: PlaceCreate, db: Session = Depends(get_db)):
    db_place = Place(**place.dict())
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

@place_router.get("/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place

@place_router.put("/{place_id}", response_model=PlaceResponse)
def update_place(place_id: int, place_data: PlaceCreate, db: Session = Depends(get_db)):
    db_place = db.query(Place).filter(Place.id == place_id).first()
    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    # ✅ Update fields
    db_place.name = place_data.name
    db_place.category = place_data.category
    db_place.latitude = place_data.latitude
    db_place.longitude = place_data.longitude
    db_place.rating = place_data.rating
    db_place.source_api = place_data.source_api
    db_place.cached_data = place_data.cached_data
    db_place.last_updated = datetime.now(timezone.utc).replace(tzinfo=None)  # ✅ Convert to UTC & remove tzinfo



    db.commit()
    db.refresh(db_place)
    return db_place

@place_router.delete("/{place_id}")
def delete_place(place_id: int, db: Session = Depends(get_db)):
    db_place = db.query(Place).filter(Place.id == place_id).first()
    if not db_place:
        raise HTTPException(status_code=404, detail="Place not found")

    db.delete(db_place)
    db.commit()
    return {"message": "Place deleted successfully"}
