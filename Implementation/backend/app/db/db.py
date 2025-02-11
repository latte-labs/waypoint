import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path

# ✅ Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# ✅ Get DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise ValueError("❌ DATABASE_URL is not set. Check your environment variables!")

# ✅ Fix the "postgres://" issue for Heroku
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"✅ Using DATABASE_URL: {DATABASE_URL}")

# ✅ Create database engine
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Import models AFTER Base is defined (Fixes Circular Import)
from app.models import *

# ✅ Force table creation
print("🔄 Creating tables if they don't exist...")
Base.metadata.create_all(bind=engine)
print("✅ Tables successfully created.")
