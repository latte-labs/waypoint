from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base  # ✅ Import Base from base.py (Fix Circular Import)

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
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
