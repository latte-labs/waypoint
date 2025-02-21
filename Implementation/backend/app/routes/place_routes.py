import requests
from pydantic import conint
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.place_model import Place
from app.schemas.place_schema import PlaceCreate, PlaceResponse
from datetime import datetime, timezone
from app.config.config import settings  # Import settings class
from app.models.quiz_model import QuizResult

# ========== PLACE ROUTES ==========
place_router = APIRouter()

GOOGLE_PLACES_API_KEY = settings.GOOGLE_PLACES_API_KEY  # ✅ Secure API Key Access

# ✅ Travel Style Mapping
TRAVEL_STYLE_MAPPING = {
    "relaxation": [
        "spa", "park", "cafe", "beach", "botanical_garden", "library",
        "hotel", "natural_feature", "lake", "scenic_lookout", "yoga_studio",
        "tea_house", "winery", "garden", "wellness_center", "hot_spring"
    ],
    "adventure": [
        "hiking", "amusement_park", "zoo", "aquarium", "ski_resort", "campground",
        "rock_climbing_gym", "bungee_jumping", "kayaking", "rafting", "surfing",
        "skydiving", "mountain", "national_park", "cave", "diving_center"
    ],
    "cultural explorer": [
        "museum", "art_gallery", "historical_site", "landmark", "church",
        "mosque", "synagogue", "temple", "library", "theater", "concert_hall",
        "cultural_center", "opera_house", "monument", "castle", "heritage_building"
    ],
    "foodie": [
        "restaurant", "bakery", "bar", "coffee_shop", "ice_cream_shop",
        "winery", "brewery", "farmers_market", "food_truck", "steakhouse",
        "sushi_restaurant", "vegetarian_restaurant", "seafood_restaurant",
        "street_food", "gourmet_store"
    ]
}


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
    travel_style: str = Query("relaxation", description="User's travel style (relaxation, adventure, culture, foodie)"),
    db: Session = Depends(get_db)
):
    """
    Fetch places from Google Places API based on user's selected travel style.
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

    # ✅ Validate travel style
    place_types = TRAVEL_STYLE_MAPPING.get(travel_style.lower())
    if not place_types:
        raise HTTPException(status_code=400, detail="Invalid travel style. Choose from relaxation, adventure, culture, foodie.")

    # ✅ Check if places already exist in the database to avoid redundant API calls
    cached_places = db.query(Place).filter(Place.category.in_(place_types)).all()
    if cached_places:
        return {"cached_places": [{"name": p.name, "lat": p.latitude, "lng": p.longitude, "category": p.category} for p in cached_places]}

    places = []

    # ✅ Fetch places for each matching place type
    for place_type in place_types:
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
            raise HTTPException(status_code=500, detail=f"Failed to fetch data from Google Places API: {response.json()}")

        data = response.json()

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

    return {"newly_added_places": [{"name": p.name, "lat": p.latitude, "lng": p.longitude, "category": p.category} for p in places]}

@place_router.get("/recommendations", response_model=list[PlaceResponse])
def get_recommendations(
    user_id: int = Query(..., description="User ID for recommendations"),
    location: str = Query(..., description="Latitude,Longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    db: Session = Depends(get_db)
):
    """
    Fetch recommended places for a user based on their travel style.
    """
    print(f"📥 Received user_id={user_id} (Type: {type(user_id)})")  # ✅ Debugging log
    print(f"📥 Received location={location}, radius={radius}")
    print(f"🔑 Google Places API Key: {GOOGLE_PLACES_API_KEY}")


    user_quiz = db.query(QuizResult).filter(QuizResult.user_id == user_id).execution_options(populate_existing=True).first()
    if not user_quiz:
        raise HTTPException(status_code=404, detail=f"User {user_id} has not completed the quiz!")

    travel_style = user_quiz.travel_style.lower()
    place_types = TRAVEL_STYLE_MAPPING.get(travel_style)
    if not place_types:
        raise HTTPException(status_code=400, detail="Invalid travel style.")

    print("⚠️ Fetching new places from Google API")
    places = []
    for place_type in place_types:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": location,
            "radius": radius,
            "type": place_type,
            "key": GOOGLE_PLACES_API_KEY
        }
        print(f"🚀 Fetching {place_type} from Google API with params: {params}")

        response = requests.get(url, params=params)
        if response.status_code != 200:
            print(f"❌ Google Places API Error: {response.json()}")
            raise HTTPException(status_code=500, detail=f"Google API Error: {response.json()}")

        data = response.json()
        print(f"📥 Raw API Response for {place_type}: {data}")
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
    print(f"📤 Successfully added {len(places)} new places from Google API")

    return places


# ✅ Now, the dynamic route comes AFTER the specific routes
@place_router.get("/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place

