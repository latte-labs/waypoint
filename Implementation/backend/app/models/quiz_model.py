from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base  # ✅ Import Base from base.py (Fix Circular Import)

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user_test_table.id"), nullable=False)  # Connects to User table
    travel_style = Column(String(50), nullable=False)

    user = relationship("User")  # Establish relationship with User
