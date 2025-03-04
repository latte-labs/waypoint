import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.place_model import Place
from app.schemas.place_schema import PlaceResponse
from datetime import datetime, timezone
from app.config.config import settings  # Secure API Key Access

place_router = APIRouter()
GOOGLE_PLACES_API_KEY = settings.GOOGLE_PLACES_API_KEY  # ✅ Secure API Key Access

# ✅ Travel Style Mapping (Subcategories)
TRAVEL_STYLE_MAPPING = {
    "relaxation": ["spa", "park", "cafe", "beach", "botanical_garden", "library", "hotel"],
    "adventure": ["amusement_park", "zoo", "aquarium", "campground", "casino", "hiking"],
    "cultural": ["museum", "art_gallery", "historical_site", "landmark", "church"],
    "foodie": ["restaurant", "bakery", "bar", "cafe", "coffee_shop"]
}

@place_router.get("/search")
def search_places(
    location: str = Query(...),
    radius: int = Query(5000),
    travel_style: str = Query(None),
    db: Session = Depends(get_db)
):
    try:
        lat, lon = map(float, location.split(","))
        print(f"📍 Location: {lat}, {lon}")  # Debugging

        if not travel_style:
            travel_style = "relaxation"  # Default travel style
        
        print(f"🎯 Travel Style: {travel_style}")  # Debugging

        place_types = TRAVEL_STYLE_MAPPING[travel_style.lower()]
        places = []

        for place_type in place_types:
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {
                "location": location,
                "radius": radius,
                "type": place_type,
                "key": GOOGLE_PLACES_API_KEY
            }

            print(f"🔍 API Request: {url}?{params}")  # Debugging

            response = requests.get(url, params=params)

            if response.status_code != 200:
                print(f"❌ API Error: {response.status_code} - {response.text}")  # Debugging
                raise HTTPException(status_code=500, detail=f"Google API Error: {response.text}")

            data = response.json()

            for result in data.get("results", []):
                places.append({
                    "name": result.get("name", "Unknown"),
                    "category": place_type,
                    "latitude": result["geometry"]["location"]["lat"],
                    "longitude": result["geometry"]["location"]["lng"],
                    "rating": result.get("rating"),
                    "source_api": "google_places",
                    "cached_data": result
                })

        return places

    except Exception as e:
        print(f"❌ Internal Error: {e}")  # Debugging
        raise HTTPException(status_code=500, detail=str(e))
