import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.config.config import settings 
from sqlalchemy.orm import Session
from app.db.db import get_db

weather_router = APIRouter()
OPENWEATHERMAP_API_KEY = settings.OPENWEATHERMAP_API_KEY

class WeatherRequest(BaseModel):
    latitude: float
    longitude: float

@weather_router.get("")
def get_weather(latitude: float, longitude: float, db: Session = Depends(get_db)):
    
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric"
    
    try: 
        response = requests.get(weather_url)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data.get("message", "Error fetching weather data"))

        weather_info = {
            "temperature": data["main"]["temp"],
            "weather_main": data["weather"][0]["main"],
            "weather_icon": data["weather"][0]["icon"],
            "weather_name": data["name"],
        }

        return {"status": "success", "data": weather_info}

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
