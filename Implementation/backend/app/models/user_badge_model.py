from sqlalchemy import Column, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID  # ✅ Use UUID Type
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base  # ✅ Fix Circular Import

# User Badge Model
class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)  # ✅ Changed to UUID
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # ✅ Updated to UUID
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False)  # ✅ Updated to UUID
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="user_badges")
    badge = relationship("Badge", back_populates="user_badges")
