import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.config.config import settings 
from sqlalchemy.orm import Session
from app.db.db import get_db

event_router = APIRouter()
ACCESS_TOKEN = settings.PREDICTHQ_API_KEY

class EventRequest(BaseModel): 
    latitude: float
    longitude: float

@event_router.get('/')
def get_events(latitude: float, longitude: float, db: Session = Depends(get_db)):

    events_url = f"https://api.predicthq.com/v1/events/"
    headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Accept": "application/json"
}
    params = {
    "within": f"1.48km@{latitude},{longitude}",
    "limit": 20,
    "state": "active"
}
    try: 
        response = requests.get(events_url, headers=headers, params=params)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data.get("message", "Error fetching events"))
        
        events_info = {
            "title": data["results"]["title"],
        }

        return {"status": "success", "data": events_info}
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))