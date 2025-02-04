from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# PostgreSQL connection string
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create a database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a session local for connecting to the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()