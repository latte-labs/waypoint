from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base  # ✅ Import Base from base.py

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ Ensure correct foreign key reference
    travel_style = Column(String(50), nullable=False)

    # ✅ Fix: Explicitly define relationship with User model
    user = relationship("User", back_populates="quiz_results")
