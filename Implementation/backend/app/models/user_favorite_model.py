from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID  # ✅ Use UUID Type
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base  # ✅ Fix Circular Import

# User Favorite Model
class UserFavorite(Base):
    __tablename__ = "user_favorites"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)  # ✅ Changed to UUID
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # ✅ Updated to UUID
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="favorites")
    place = relationship("Place", back_populates="favorites")
