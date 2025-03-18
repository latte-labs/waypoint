from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.config import settings
from app.db.db import SessionLocal
from sqlalchemy.sql import text  # ✅ Import `text`
import os
import boto3
from dotenv import load_dotenv
import uvicorn

from app.routes import (
    user_routes, 
    itinerary_routes, 
    place_routes, 
    badge_routes, 
    quiz_routes, 
    user_favorite_routes,  # ✅ Added User Favorites
    chatbot_routes,
    travel_style_routes,
    weather_routes,
)   

app = FastAPI()

load_dotenv()


# AWS Credentials
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

# Initialize S3 Client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)


# ✅ Include routers
app.include_router(user_routes.user_router, prefix="/users", tags=["Users"])
app.include_router(itinerary_routes.itinerary_router, prefix="/itineraries", tags=["Itineraries"])
app.include_router(place_routes.place_router, prefix="/places", tags=["Places"])
app.include_router(badge_routes.badge_router, prefix="/badges", tags=["Badges"])
app.include_router(quiz_routes.quiz_router, prefix="/quiz_results", tags=["Quiz Results"])
app.include_router(user_favorite_routes.user_favorite_router, prefix="/user_favorites", tags=["User Favorites"])
app.include_router(chatbot_routes.chatbot_router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(travel_style_routes.travel_style_router, prefix="/travel-styles", tags=["Travel Style"])
app.include_router(weather_routes.weather_router, prefix="/weather", tags=["Weather Details"])

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# ✅ Health Check Endpoint
@app.get("/healthcheck")
def healthcheck():
    return {"status": "FastAPI is running!"}

# ✅ Fix: Use `text()` to wrap raw SQL
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT current_database();"))  # ✅ Wrap SQL in `text()`
        return {"Connected to database": result.fetchone()[0]}
    except Exception as e:
        return {"error": str(e)}



# ✅ Ensure Uvicorn runs with Heroku's $PORT
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Default to 8000 if PORT is not set
    uvicorn.run(app, host="0.0.0.0", port=port)

@app.get("/generate-presigned-url/")
def generate_presigned_url(filename: str):
    """
    Generates a pre-signed URL for secure file uploads to AWS S3.
    """
    try:
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": AWS_BUCKET_NAME, "Key": filename, "ContentType": "image/jpeg"},
            ExpiresIn=3600,  # URL expires in 1 hour
        )
        return {"url": presigned_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating pre-signed URL: {str(e)}")
