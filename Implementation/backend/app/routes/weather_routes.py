from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.config.config import settings 
from sqlalchemy.orm import Session
from app.db.db import get_db


weather_router = APIRouter()
OPENWEATHERMAP_API_KEY = settings.OPENWEATHERMAP_API_KEY

class WeatherRequest(BaseModel):
    coordinates: str

# @weather_router.get('/')
# def get_weather(coordinates: str, db: Session = Depends(get_db)):
#     try: 