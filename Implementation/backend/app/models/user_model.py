from sqlalchemy import Column, Integer, String
from app.db.db import Base  # Ensure this matches db.py

class User(Base):
    __tablename__ = "user_test_table"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
