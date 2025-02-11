from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.db import Base

# Travel Style Model
class TravelStyle(Base):
    __tablename__ = "travel_styles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    users = relationship("User", back_populates="travel_style")