from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID  # ✅ Use UUID Type
from sqlalchemy.orm import relationship
from app.db.base import Base  # ✅ Fix Circular Import
import uuid

# Badge Model
class Badge(Base):
    __tablename__ = "badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)  # ✅ Changed to UUID
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    level = Column(String, nullable=False)
    
    user_badges = relationship("UserBadge", back_populates="badge")
