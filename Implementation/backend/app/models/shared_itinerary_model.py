from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.db import Base

# Shared Itinerary Model
class SharedItinerary(Base):
    __tablename__ = "shared_itineraries"
    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="viewer")
    added_at = Column(DateTime, default=datetime.utcnow)
    
    itinerary = relationship("Itinerary", back_populates="shared_users")
    user = relationship("User", back_populates="shared_itineraries")