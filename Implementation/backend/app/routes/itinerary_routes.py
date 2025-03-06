from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.db import get_db  # ✅ Import database session from db.py
from app.models import itinerary_models
from app.schemas import itinerary_schema

import uuid

itinerary_router = APIRouter()

# -------------------- Itinerary Routes --------------------

@itinerary_router.post("/", response_model=itinerary_schema.ItineraryResponse)
def create_itinerary(itinerary: itinerary_schema.ItineraryCreate, db: Session = Depends(get_db)):
    new_itinerary = itinerary_models.Itinerary(
        id=uuid.uuid4(),
        name=itinerary.name,
        destination=itinerary.destination,
        start_date=itinerary.start_date,
        end_date=itinerary.end_date,
        created_by=itinerary.created_by,
        travel_style=itinerary.travel_style,
        budget=itinerary.budget,
        extra_data=itinerary.extra_data,
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary


@itinerary_router.get("/{itinerary_id}", response_model=itinerary_schema.ItineraryResponse)
def get_itinerary(itinerary_id: uuid.UUID, db: Session = Depends(get_db)):
    itinerary = db.query(itinerary_models.Itinerary).filter(itinerary_models.Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary


# -------------------- Itinerary Day Routes --------------------

@itinerary_router.post("/{itinerary_id}/days/", response_model=itinerary_schema.ItineraryDayResponse)
def add_day_to_itinerary(itinerary_id: uuid.UUID, day: itinerary_schema.ItineraryDayCreate, db: Session = Depends(get_db)):
    itinerary = db.query(itinerary_models.Itinerary).filter(itinerary_models.Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    new_day = itinerary_models.ItineraryDay(
        id=uuid.uuid4(),
        itinerary_id=itinerary_id,
        date=day.date,
        title=day.title
    )
    db.add(new_day)
    db.commit()
    db.refresh(new_day)
    return new_day


# -------------------- Activity Routes --------------------

@itinerary_router.post("/{itinerary_id}/days/{day_id}/activities/", response_model=itinerary_schema.ActivityResponse)
def add_activity(day_id: uuid.UUID, activity: itinerary_schema.ActivityCreate, db: Session = Depends(get_db)):
    day = db.query(itinerary_models.ItineraryDay).filter(itinerary_models.ItineraryDay.id == day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")
    
    new_activity = itinerary_models.Activity(
        id=uuid.uuid4(),
        itinerary_day_id=day_id,
        time=activity.time,
        name=activity.name,
        location=activity.location,
        notes=activity.notes,
        estimated_cost=activity.estimated_cost,
        extra_data=activity.extra_data,
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    return new_activity


# -------------------- Itinerary Member Routes (For Collaboration) --------------------

@itinerary_router.post("/{itinerary_id}/members/", response_model=itinerary_schema.ItineraryMemberResponse)
def add_member(itinerary_id: uuid.UUID, member: itinerary_schema.ItineraryMemberCreate, db: Session = Depends(get_db)):
    itinerary = db.query(itinerary_models.Itinerary).filter(itinerary_models.Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    existing_member = db.query(itinerary_models.ItineraryMember).filter(
        itinerary_models.ItineraryMember.itinerary_id == itinerary_id,
        itinerary_models.ItineraryMember.user_id == member.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this itinerary")

    new_member = itinerary_models.ItineraryMember(
        id=uuid.uuid4(),
        itinerary_id=itinerary_id,
        user_id=member.user_id,
        role=member.role,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@itinerary_router.get("/{itinerary_id}/members/", response_model=list[itinerary_schema.ItineraryMemberResponse])
def get_itinerary_members(itinerary_id: uuid.UUID, db: Session = Depends(get_db)):
    members = db.query(itinerary_models.ItineraryMember).filter(itinerary_models.ItineraryMember.itinerary_id == itinerary_id).all()
    if not members:
        raise HTTPException(status_code=404, detail="No members found for this itinerary")
    return members
