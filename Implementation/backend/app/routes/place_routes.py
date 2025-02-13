import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.place_model import Place
from app.schemas.place_schema import PlaceCreate, PlaceResponse
from datetime import datetime, timezone
from app.config.config import settings  # Import settings class

# ========== PLACE ROUTES ==========
place_router = APIRouter()

GOOGLE_PLACES_API_KEY = settings.GOOGLE_PLACES_API_KEY  # ✅ Secure API Key Access

@place_router.post("/", response_model=PlaceResponse)
def create_place(place: PlaceCreate, db: Session = Depends(get_db)):
    db_place = Place(**place.dict())
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

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

# ===================== 🔥 GOOGLE PLACES API INTEGRATION 🔥 =====================

@place_router.get("/search")
def search_places(
    location: str = Query(..., description="Latitude,Longitude (e.g., 49.2827,-123.1207 for Vancouver)"),
    radius: int = Query(5000, description="Search radius in meters"),
    place_type: str = Query("restaurant", description="Type of place (e.g., restaurant, museum, park)"),
    db: Session = Depends(get_db)
):
    """
    Fetch places from Google Places API based on location & type.
    Restricts search to British Columbia (BC), Canada.
    """

    # ✅ Extract latitude & longitude
    try:
        lat, lon = map(float, location.split(","))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid location format. Use 'latitude,longitude'.")

    # ✅ Restrict to British Columbia (BC), Canada
    if not (48.3 <= lat <= 60.0 and -139.1 <= lon <= -114.0):
        raise HTTPException(status_code=403, detail="Location outside of British Columbia, Canada.")

    # ✅ Check if places already exist in the database to avoid redundant API calls
    cached_places = db.query(Place).filter(Place.category == place_type).all()
    if cached_places:
        return {"cached_places": [p.name for p in cached_places]}

    # ✅ Google Places API Request (OLD API FORMAT)
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": location,
        "radius": radius,
        "type": place_type,
        "key": GOOGLE_PLACES_API_KEY
    }

    response = requests.get(url, params=params)
    
    # ✅ Handle API Errors
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {response.json()}")

    data = response.json()
    places = []

    # ✅ Process API Results & Store in Database
    for result in data.get("results", []):
        place = Place(
            name=result.get("name", "Unknown"),
            category=place_type,
            latitude=result["geometry"]["location"]["lat"],
            longitude=result["geometry"]["location"]["lng"],
            rating=result.get("rating"),
            source_api="google_places",
            cached_data=result
        )
        db.add(place)
        places.append(place)

    db.commit()

    return {"newly_added_places": [p.name for p in places]}

# ✅ Now, the dynamic route comes AFTER the specific routes
@place_router.get("/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place
