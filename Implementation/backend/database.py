# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from base import Base  # Ensure base is correctly imported

# PostgreSQL connection string (Heroku provides DATABASE_URL)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables")

# Create a database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a session local for connecting to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to create the test table
def create_test_table():
    # This will create all tables defined in the Base class, including TestUser
    Base.metadata.create_all(bind=engine)
    print("Test table created successfully!")
