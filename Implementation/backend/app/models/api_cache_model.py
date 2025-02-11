from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.db import Base


# API Cache Model
class APICache(Base):
    __tablename__ = "api_cache"
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)  # GooglePlaces or Eventbrite
    data = Column(JSON, nullable=False)  # Store JSON response data
    fetched_at = Column(DateTime, default=datetime.utcnow)
