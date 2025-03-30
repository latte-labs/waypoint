import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.place_model import Place
from app.schemas.place_schema import PlaceResponse
from datetime import datetime, timezone
from app.config.config import settings  # Secure API Key Access
from typing import List
from fastapi.responses import JSONResponse

place_router = APIRouter()
GOOGLE_PLACES_API_KEY = settings.GOOGLE_PLACES_API_KEY  # ✅ Secure API Key Access

# ✅ Travel Style Mapping (Subcategories)
TRAVEL_STYLE_MAPPING = {
    "relaxation": ["park", "beach", "spa", "massage"],
    "adventure": ["amusement_park", "zoo", "aquarium"],
    "cultural": ["museum", "art_gallery", "historical_place", "monument"],
    "foodie": ["restaurant", "bakery", "bar", "cafe", "coffee_shop"]
}

@place_router.get("/search")
def search_places(
    location: str = Query(...),
    radius: int = Query(100),  # ✅ Set default radius to 100 meters
    travel_style: str = Query(None),
    db: Session = Depends(get_db)
):
    try:
        lat, lon = map(float, location.split(","))
        print(f"📍 Location: {lat}, {lon}")

        if not travel_style:
            travel_style = "relaxation"
        
        print(f"🎯 Travel Style: {travel_style}")

        place_types = TRAVEL_STYLE_MAPPING[travel_style.lower()]
        places = []

        # ✅ One single API request with all includedTypes
        url = "https://places.googleapis.com/v1/places:searchNearby"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": "places.displayName,places.location,places.rating,places.types"
        }
        body = {
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lon
                    },
                    "radius": radius
                }
            },
            "includedTypes": place_types,
            "maxResultCount": 20  # PLACES API DEFAULT MAX LIMIT
        }

        # print(f"📡 API Body: {body}")  # Optional debugging
        response = requests.post(url, headers=headers, json=body)

        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail=f"Google API Error: {response.text}")

        data = response.json()

        for result in data.get("places", []):
            name = result.get("displayName", {}).get("text", "Unknown")
            latitude = result["location"]["latitude"]
            longitude = result["location"]["longitude"]
            rating = result.get("rating")
            types = result.get("types", [])
            category = types[0] if types else "unknown"  # ✅ Use first type as category

            place_data = {
                "name": name,
                "category": category,
                "latitude": latitude,
                "longitude": longitude,
                "rating": rating,
                "source_api": "google_places_v3",
                "cached_data": result
            }

            # ✅ Save to DB
            place_record = Place(
                name=place_data["name"],
                category=place_data["category"],
                latitude=place_data["latitude"],
                longitude=place_data["longitude"],
                rating=place_data["rating"],
                source_api=place_data["source_api"],
                cached_data=place_data["cached_data"],
                last_updated=datetime.utcnow()
            )
            existing_place = db.query(Place).filter(
                Place.name == place_data["name"],
                Place.latitude == place_data["latitude"],
                Place.longitude == place_data["longitude"]
            ).first()

            if existing_place:
                print(f"⚠️ Skipping duplicate place: {place_data['name']}")
                continue

            db.add(place_record)

            # ✅ Return value to frontend
            places.append(place_data)

        # ✅ Commit after the loop
        db.commit()


        return places

    except Exception as e:
        print(f"❌ Internal Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@place_router.get("/cached")
def get_cached_places(
    location: str = Query(...),
    radius: int = Query(10000),
    travel_style: str = Query(None),
    db: Session = Depends(get_db)
):
    try:
        lat, lon = map(float, location.split(","))

        db_places = db.query(Place).all()
        filtered = []

        for place in db_places:
            # Basic radius filter (approximate)
            distance = ((place.latitude - lat) ** 2 + (place.longitude - lon) ** 2) ** 0.5
            within_radius = distance <= radius / 111_000  # Convert meters to degrees

            # ✅ Filter by travel style mapped types
            matches_style = True
            if travel_style and travel_style.lower() in TRAVEL_STYLE_MAPPING:
                matches_style = place.category in TRAVEL_STYLE_MAPPING[travel_style.lower()]

            if within_radius and matches_style:
                filtered.append({
                    "name": place.name,
                    "category": place.category,
                    "latitude": place.latitude,
                    "longitude": place.longitude,
                    "rating": place.rating,
                    "source_api": place.source_api,
                    "cached_data": place.cached_data
                })

        return filtered

    except Exception as e:
        print(f"❌ Internal Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@place_router.get("/cached/filtered")
def get_filtered_places(
    location: str = Query(..., description="Latitude,Longitude as a comma-separated string"),
    radius: int = Query(10000, description="Search radius in meters"),
    db: Session = Depends(get_db)
):
    try: 
        lat, lon = map(float, location.split(","))
        db_places = db.query(Place).all()
        allowed_categories = {"park", "bar", "museum"}
        filtered = []

        for place in db_places:
            # Basic approximate radius filter (converting meters to degrees ~111,000 m/degree)
            distance = ((place.latitude - lat) ** 2 + (place.longitude - lon) ** 2) ** 0.5
            within_radius = distance <= radius / 111000

            if within_radius:
                # First, check top-level category
                cat = place.category.lower() if place.category else ""
                if cat in allowed_categories:
                    filtered.append({
                        "name": place.name,
                        "category": place.category,
                        "latitude": place.latitude,
                        "longitude": place.longitude,
                        "rating": place.rating,
                        "source_api": place.source_api,
                        "cached_data": place.cached_data
                    })
                # Otherwise, check if any of the cached_data.types match allowed categories
                # elif place.cached_data and "types" in place.cached_data:
                #     types_lower = [t.lower() for t in place.cached_data.get("types", [])]
                #     if any(t in allowed_categories for t in types_lower):
                #         filtered.append({
                #             "name": place.name,
                #             "category": place.category,
                #             "latitude": place.latitude,
                #             "longitude": place.longitude,
                #             "rating": place.rating,
                #             "source_api": place.source_api,
                #             "cached_data": place.cached_data
                #         })
        return filtered
    except Exception as e:
        print(f"Internal Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))