from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models import user_model, itinerary_model, place_model, badge_model, quiz_model
from app.schemas import user_schema, itinerary_schema, place_schema, badge_schema, quiz_schema

# ========== ITINERARY ROUTES ==========
itinerary_router = APIRouter()

@itinerary_router.post("/itineraries", response_model=itinerary_schema.ItineraryResponse)
def create_itinerary(itinerary: itinerary_schema.ItineraryCreate, db: Session = Depends(get_db)):
    db_itinerary = itinerary_model.Itinerary(**itinerary.dict())
    db.add(db_itinerary)
    db.commit()
    db.refresh(db_itinerary)
    return db_itinerary

@itinerary_router.get("/itineraries/{itinerary_id}", response_model=itinerary_schema.ItineraryResponse)
def get_itinerary(itinerary_id: int, db: Session = Depends(get_db)):
    itinerary = db.query(itinerary_model.Itinerary).filter(itinerary_model.Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary