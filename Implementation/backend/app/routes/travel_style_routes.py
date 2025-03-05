from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.travel_style_model import TravelStyle  # ✅ Ensure this model exists

travel_style_router = APIRouter()

@travel_style_router.get("/{travel_style_id}")
def get_travel_style(travel_style_id: int, db: Session = Depends(get_db)):
    """
    ✅ Fetch travel style details by ID.
    """
    travel_style = db.query(TravelStyle).filter(TravelStyle.id == travel_style_id).first()
    if not travel_style:
        raise HTTPException(status_code=404, detail="Travel style not found")

    return {
        "id": travel_style.id,
        "name": travel_style.name,
        "description": travel_style.description
    }
