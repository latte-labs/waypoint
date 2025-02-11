from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path
import os

# ✅ Import Base from base.py (Fixes Circular Import)
from app.db.base import Base

# Load .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your .env file!")

print(f"✅ Using DATABASE_URL: {DATABASE_URL}")

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Import models AFTER Base is defined (Fixes Circular Import)
from app.models import *

# ✅ Force table creation
print("🔄 Creating tables if they don't exist...")
Base.metadata.create_all(bind=engine)
print("✅ Tables successfully created.")

# ✅ Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
