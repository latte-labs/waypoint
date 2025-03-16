from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.db import get_db  # ✅ Import database session from db.py
from app.models.itinerary_models import Itinerary, ItineraryDay, Activity, ItineraryMember
from app.schemas import itinerary_schema
from app.schemas.itinerary_detail_schema import ItineraryDetailResponseSchema
from typing import List
import uuid
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID

itinerary_router = APIRouter()

# -------------------- Itinerary Routes --------------------

@itinerary_router.post("/", response_model=itinerary_schema.ItineraryResponse)
def create_itinerary(itinerary: itinerary_schema.ItineraryCreate, db: Session = Depends(get_db)):
    new_itinerary = Itinerary(
        id=uuid.uuid4(),
        name=itinerary.name,
        destination=itinerary.destination,
        start_date=itinerary.start_date,
        end_date=itinerary.end_date,
        created_by=itinerary.created_by,
        travel_style=itinerary.travel_style,
        budget=itinerary.budget,
        extra_data=itinerary.extra_data,
        last_updated_by=itinerary.created_by  # Set last_updated_by to created_by initially
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    return new_itinerary

@itinerary_router.get("/{itinerary_id}", response_model=ItineraryDetailResponseSchema)
def get_itinerary(itinerary_id: str, db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    # ✅ Fetch days ordered by `order_index`
    itinerary_days = db.query(ItineraryDay).filter(ItineraryDay.itinerary_id == itinerary_id).order_by(ItineraryDay.order_index).all()

    return ItineraryDetailResponseSchema(
        id=itinerary.id,
        name=itinerary.name,
        destination=itinerary.destination,
        start_date=itinerary.start_date,
        end_date=itinerary.end_date,
        created_by=itinerary.created_by,
        updated_at=itinerary.updated_at,
        last_updated_by=itinerary.last_updated_by,  # NEW: pass this field
        budget=itinerary.budget,
        days=[
            {
                "id": day.id,
                "date": day.date,
                "title": day.title,
                "activities": [
                    {
                        "id": activity.id,
                        "time": activity.time,
                        "name": activity.name,
                        "location": activity.location
                    }
                    for activity in db.query(Activity).filter(Activity.itinerary_day_id == day.id).all()
                ]
            }
            for day in itinerary_days
        ]
    )




# -------------------- Itinerary Day Routes --------------------

@itinerary_router.post("/{itinerary_id}/days/", response_model=itinerary_schema.ItineraryDayResponse)
def add_day_to_itinerary(
    itinerary_id: uuid.UUID,
    day: itinerary_schema.ItineraryDayCreate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    max_order = db.query(func.max(ItineraryDay.order_index)).filter(ItineraryDay.itinerary_id == itinerary_id).scalar()
    new_order_index = (max_order + 1) if max_order is not None else 0

    new_day = ItineraryDay(
        id=uuid.uuid4(),
        itinerary_id=itinerary_id,
        date=day.date,
        title=day.title,
        order_index=new_order_index
    )

    db.add(new_day)
    db.commit()
    db.refresh(new_day)

    # Update itinerary metadata
    itinerary.updated_at = datetime.utcnow()
    itinerary.last_updated_by = x_user_id
    db.commit()

    return new_day


# -------------------- Activity Routes --------------------

@itinerary_router.post("/{itinerary_id}/days/{day_id}/activities/", response_model=itinerary_schema.ActivityResponse)
def add_activity(
    itinerary_id: uuid.UUID,
    day_id: uuid.UUID,
    activity: itinerary_schema.ActivityCreate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    day = db.query(ItineraryDay).filter(
        ItineraryDay.id == day_id, ItineraryDay.itinerary_id == itinerary_id
    ).first()
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")

    def format_time(time_str):
        try:
            return datetime.strptime(time_str, "%I%p").strftime("%I:%M %p")
        except ValueError:
            try:
                return datetime.strptime(time_str, "%I:%M%p").strftime("%I:%M %p")
            except ValueError:
                return time_str

    new_activity = Activity(
        id=uuid.uuid4(),
        itinerary_day_id=day_id,
        time=format_time(activity.time),
        name=activity.name,
        location=activity.location,
        notes=activity.notes if activity.notes else "",
        estimated_cost=float(activity.estimated_cost) if activity.estimated_cost is not None else 0.0,
        extra_data=activity.extra_data if activity.extra_data else {},
        created_at=datetime.utcnow(),
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    # Update itinerary metadata:
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if itinerary:
        itinerary.updated_at = datetime.utcnow()
        itinerary.last_updated_by = x_user_id
        db.commit()

    return new_activity


# -------------------- Itinerary Member Routes (For Collaboration) --------------------

@itinerary_router.post("/{itinerary_id}/members/", response_model=itinerary_schema.ItineraryMemberResponse)
def add_member(itinerary_id: uuid.UUID, member: itinerary_schema.ItineraryMemberCreate, db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    existing_member = db.query(ItineraryMember).filter(
        ItineraryMember.itinerary_id == itinerary_id,
        ItineraryMember.user_id == member.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this itinerary")

    new_member = ItineraryMember(
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
    members = db.query(ItineraryMember).filter(ItineraryMember.itinerary_id == itinerary_id).all()
    if not members:
        raise HTTPException(status_code=404, detail="No members found for this itinerary")
    return members

@itinerary_router.get("/users/{user_id}/itineraries", response_model=List[itinerary_schema.ItinerarySchema])
def get_user_itineraries(user_id: str, db: Session = Depends(get_db)):
    """
    ✅ Fetches all itineraries for a specific user.
    """
    itineraries = db.query(Itinerary).filter(Itinerary.created_by == user_id).all()

    if not itineraries:
        return []  # ✅ Instead of 404, return an empty list if no itineraries exist.

    return itineraries

@itinerary_router.patch("/{itinerary_id}/days/reorder", response_model=dict)
def reorder_days(itinerary_id: str, reorder_request: itinerary_schema.ReorderDaysRequest, db: Session = Depends(get_db)):
    """
    ✅ Updates the order of days inside an itinerary.
    """
    try:
        # Validate that all provided days exist
        day_ids = [d.id for d in reorder_request.days]
        days = db.query(ItineraryDay).filter(ItineraryDay.id.in_(day_ids)).all()

        if len(days) != len(day_ids):
            raise HTTPException(status_code=400, detail="One or more day IDs are invalid.")

        # ✅ Update order_index based on frontend request
        for item in reorder_request.days:
            day = next((d for d in days if d.id == item.id), None)
            if day:
                day.order_index = item.order_index

        db.commit()
        return {"message": "Days reordered successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@itinerary_router.get("/{itinerary_id}/days/{day_id}", response_model=itinerary_schema.ItineraryDayResponse)
def get_day_activities(itinerary_id: uuid.UUID, day_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Fetch all activities for a specific day in an itinerary.
    """
    from datetime import datetime

    # ✅ Validate that the day exists
    day = db.query(ItineraryDay).filter(ItineraryDay.id == day_id, ItineraryDay.itinerary_id == itinerary_id).first()
    
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    # ✅ Function to format time before returning response
    def format_time(time_str):
        """Convert stored time into HH:MM AM/PM format."""
        try:
            return datetime.strptime(time_str, "%I%p").strftime("%I:%M %p")  # "8AM" -> "08:00 AM"
        except ValueError:
            try:
                return datetime.strptime(time_str, "%I:%M%p").strftime("%I:%M %p")  # "8:30AM" -> "08:30 AM"
            except ValueError:
                return time_str  # 🚨 If format is unknown, keep it unchanged

    # ✅ Fetch activities and format them for response
    activities = db.query(Activity).filter(Activity.itinerary_day_id == day_id).all()
    activity_list = [
        itinerary_schema.ActivityResponse(
            id=activity.id, 
            name=activity.name, 
            time=format_time(activity.time),  # ✅ Ensure time format is consistent
            location=activity.location, 
            notes=activity.notes if activity.notes else "",  # ✅ Ensure notes are never `null`
            estimated_cost=float(activity.estimated_cost) if activity.estimated_cost is not None else 0.0,  # ✅ Convert to float to avoid issues
            extra_data=activity.extra_data if activity.extra_data else {},  # ✅ Ensure extra_data is not `null`
            created_at=activity.created_at
        ) 
        for activity in activities
    ]

    # ✅ Return the response with actual `title` and formatted activities
    return {
        "id": day.id,
        "date": day.date,
        "title": day.title,  # ✅ Returns correct title from DB
        "created_at": day.created_at,
        "activities": activity_list
    }

@itinerary_router.delete("/{itinerary_id}", status_code=200)
def delete_itinerary(itinerary_id: str, db: Session = Depends(get_db)):
    """
    ✅ Deletes an itinerary and all associated data.
    """
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()

    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    # ✅ Delete Itinerary & Related Data
    db.delete(itinerary)
    db.commit()

    return {"message": "Itinerary deleted successfully"}

@itinerary_router.delete("/{itinerary_id}/days/{day_id}", status_code=200)
def delete_itinerary_day(
    itinerary_id: str,
    day_id: str,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    day = db.query(ItineraryDay).filter(
        ItineraryDay.id == day_id, 
        ItineraryDay.itinerary_id == itinerary_id
    ).first()
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")

    db.delete(day)
    db.commit()

    # Update itinerary metadata:
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if itinerary:
        itinerary.updated_at = datetime.utcnow()
        itinerary.last_updated_by = x_user_id
        db.commit()

    return {"message": "Itinerary day deleted successfully"}

@itinerary_router.put("/{itinerary_id}", status_code=200)
def update_itinerary(
    itinerary_id: str,
    updated_itinerary: itinerary_schema.ItinerarySchema,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")  # Read user ID from header
):
    """
    ✅ Updates an existing itinerary with new details.
    """
    try:
        itinerary_uuid = UUID(itinerary_id)  # Convert to UUID explicitly
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid itinerary ID format")

    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_uuid).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    # Ensure `id` in the body matches `itinerary_id`
    if updated_itinerary.id and str(updated_itinerary.id) != str(itinerary_id):
        raise HTTPException(status_code=400, detail="ID in request body must match the URL parameter")

    # Update itinerary details
    itinerary.name = updated_itinerary.name
    itinerary.destination = updated_itinerary.destination
    itinerary.start_date = updated_itinerary.start_date
    itinerary.end_date = updated_itinerary.end_date
    itinerary.budget = updated_itinerary.budget
    itinerary.updated_at = datetime.utcnow()
    itinerary.last_updated_by = x_user_id  # Set the last updated by field

    db.commit()
    db.refresh(itinerary)

    print(f"✅ Itinerary updated successfully: {itinerary}")
    return {"message": "Itinerary updated successfully", "itinerary_id": itinerary.id}

@itinerary_router.put("/{itinerary_id}/days/{day_id}", response_model=itinerary_schema.ItineraryDayResponse)
def update_itinerary_day(
    itinerary_id: uuid.UUID,
    day_id: uuid.UUID,
    updated_day: itinerary_schema.ItineraryDayUpdate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    day = db.query(ItineraryDay).filter(
        ItineraryDay.id == day_id, 
        ItineraryDay.itinerary_id == itinerary_id
    ).first()
    if not day:
        raise HTTPException(status_code=404, detail="Itinerary day not found")
    
    day.title = updated_day.title
    day.date = updated_day.date
    db.commit()
    db.refresh(day)

    # Update itinerary metadata:
    itinerary.updated_at = datetime.utcnow()
    itinerary.last_updated_by = x_user_id
    db.commit()

    return day

@itinerary_router.delete(
    "/{itinerary_id}/days/{day_id}/activities/{activity_id}",
    status_code=200,
    response_model=dict
)
def delete_activity(
    itinerary_id: str,
    day_id: str,
    activity_id: str,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.itinerary_day_id == day_id
    ).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    # Update itinerary metadata:
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if itinerary:
        itinerary.updated_at = datetime.utcnow()
        itinerary.last_updated_by = x_user_id
        db.commit()

    return {"detail": "Activity deleted successfully."}


@itinerary_router.put(
    "/{itinerary_id}/days/{day_id}/activities/{activity_id}",
    response_model=itinerary_schema.ActivityResponseSchema
)
def update_activity(
    itinerary_id: str,
    day_id: str,
    activity_id: str,
    activity_update: itinerary_schema.ActivityUpdateSchema,
    db: Session = Depends(get_db),
    x_user_id: str = Header(..., alias="X-User-Id")
):
    print(f"🔍 Incoming Update Request - Activity ID: {activity_id}, Payload: {activity_update}")
    print(f"🔍 X-User-Id: {x_user_id}")

    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.itinerary_day_id == day_id
    ).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = activity_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)

    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if itinerary:
        itinerary.updated_at = datetime.utcnow()
        itinerary.last_updated_by = x_user_id
        db.commit()

    return {
    "id": str(activity.id),  # ✅ Convert UUID to string
    "itinerary_day_id": str(activity.itinerary_day_id),  # ✅ Convert UUID to string
    "name": activity.name,
    "time": activity.time,
    "location": activity.location,
    "notes": activity.notes,
    "estimated_cost": activity.estimated_cost,
    "extra_data": activity.extra_data,
    "created_at": activity.created_at,
    }
