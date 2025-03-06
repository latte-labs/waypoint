from sqlalchemy import Column, String, ForeignKey, DateTime, Integer  # ✅ Added Integer
from sqlalchemy.dialects.postgresql import UUID  # ✅ Use UUID for user_id only
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid  # ✅ Required for UUID default values

from app.db.base import Base  # ✅ Import Base from base.py

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)  # ✅ UUID for user ID
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    travel_style_id = Column(Integer, ForeignKey("travel_styles.id"), nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    travel_style = relationship("TravelStyle", back_populates="users")
    favorites = relationship("UserFavorite", back_populates="user")
    itineraries = relationship("Itinerary", back_populates="user")
    shared_itineraries = relationship("SharedItinerary", back_populates="user")
    user_badges = relationship("UserBadge", back_populates="user")
    quiz_results = relationship("QuizResult", back_populates="user")
    itineraries = relationship("Itinerary", back_populates="owner")  # ✅ Fix: Ensure back_populates matches `owner`

