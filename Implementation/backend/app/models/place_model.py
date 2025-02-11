from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.db import Base

# Place Model
class Place(Base):
    __tablename__ = "places"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    source_api = Column(String, nullable=False)
    cached_data = Column(JSON, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    favorites = relationship("UserFavorite", back_populates="place")
    itinerary_details = relationship("ItineraryDetail", back_populates="place")