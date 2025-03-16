from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Float, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base  # ✅ Import Base from base.py (Fix Circular Import)


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # ✅ UUID Type
    name = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    travel_style = Column(String, nullable=True)
    budget = Column(Float, nullable=True)
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_updated_by = Column(UUID(as_uuid=True), nullable=False)


    # ✅ Relationships
    members = relationship("ItineraryMember", back_populates="itinerary", cascade="all, delete")
    owner = relationship("User", back_populates="itineraries")  # ✅ Fix: Ensure `User` model has `itineraries`
    days = relationship("ItineraryDay", back_populates="itinerary", cascade="all, delete")
    
    # ✅ Ensure SharedItinerary is referenced if used in your project
    shared_itineraries = relationship("SharedItinerary", back_populates="itinerary", cascade="all, delete")


class ItineraryMember(Base):
    __tablename__ = "itinerary_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # ✅ UUID Type
    itinerary_id = Column(UUID(as_uuid=True), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False)  # ✅ Must match `Itinerary.id`
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum("Owner", "Editor", "Viewer", name="member_role"), nullable=False, default="Editor")
    joined_at = Column(DateTime, default=datetime.utcnow)

    itinerary = relationship("Itinerary", back_populates="members")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    itinerary_id = Column(UUID(as_uuid=True), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)  # ✅ New column
    created_at = Column(DateTime, default=datetime.utcnow)


    itinerary = relationship("Itinerary", back_populates="days")
    activities = relationship("Activity", back_populates="day", cascade="all, delete")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    itinerary_day_id = Column(UUID(as_uuid=True), ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False)
    time = Column(String, nullable=False)  # Keeping it simple, can be changed to TIME type
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    extra_data = Column(JSON, nullable=True)  # ✅ Allow storing structured extra data
    created_at = Column(DateTime, default=datetime.utcnow)

    day = relationship("ItineraryDay", back_populates="activities")
