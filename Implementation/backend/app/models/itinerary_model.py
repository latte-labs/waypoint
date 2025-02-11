from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.db import Base

# Itinerary Model
class Itinerary(Base):
    __tablename__ = "itineraries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="itineraries")
    details = relationship("ItineraryDetail", back_populates="itinerary")
    shared_users = relationship("SharedItinerary", back_populates="itinerary")