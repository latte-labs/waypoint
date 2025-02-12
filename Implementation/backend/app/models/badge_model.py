from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base  # ✅ Import Base from base.py (Fix Circular Import)

# Badge Model
class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    level = Column(String, nullable=False)
    
    user_badges = relationship("UserBadge", back_populates="badge")