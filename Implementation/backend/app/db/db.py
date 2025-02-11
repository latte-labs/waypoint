import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Retrieve the database connection URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Ensure DATABASE_URL is not None before proceeding
if DATABASE_URL:
    # Fix Heroku's incorrect `postgres://` format
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")

    # Apply `sslmode="require"` only for Heroku, not local development
    if "heroku" in DATABASE_URL:
        engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})
    else:
        engine = create_engine(DATABASE_URL)  # Local PostgreSQL doesn't require