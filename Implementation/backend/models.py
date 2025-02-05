# backend/models.py
from sqlalchemy import Column, Integer, String
from base import Base  # Importing the Base class from base.py to inherit

# Define the TestUser model (table)
class TestUser(Base):
    __tablename__ = 'test_users'  # The name of the table in the database

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
