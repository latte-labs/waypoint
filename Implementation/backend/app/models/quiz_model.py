from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID  # ✅ Use UUID Type
from sqlalchemy.orm import relationship
from app.db.base import Base  # ✅ Fix Circular Import
import uuid

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)  # ✅ Changed to UUID
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # ✅ Updated to UUID
    travel_style = Column(String(50), nullable=False)

    user = relationship("User", back_populates="quiz_results")
