from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base  # ✅ Import Base from base.py (Fix Circular Import)

# Itinerary Detail Model
class ItineraryDetail(Base):
    __tablename__ = "itinerary_details"
    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    visit_date = Column(DateTime, nullable=True)
    
    itinerary = relationship("Itinerary", back_populates="details")
    place = relationship("Place", back_populates="itinerary_details")