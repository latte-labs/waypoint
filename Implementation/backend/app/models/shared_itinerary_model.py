from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID  # ✅ Import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid  # ✅ Required for UUID default values

from app.db.base import Base  # ✅ Import Base

class SharedItinerary(Base):
    __tablename__ = "shared_itineraries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # ✅ Changed to UUID
    itinerary_id = Column(UUID(as_uuid=True), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False)  # ✅ Must match Itinerary.id
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # ✅ Ensure user_id is also UUID
    role = Column(String, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    itinerary = relationship("Itinerary", back_populates="shared_itineraries")
    user = relationship("User", back_populates="shared_itineraries")  # ✅ Fix: Add relationship to User

