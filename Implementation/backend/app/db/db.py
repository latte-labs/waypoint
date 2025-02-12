from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path
import os

# ✅ Load environment variables ONLY in local environment
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

if os.getenv("DATABASE_URL") is None:
    print("🔍 Loading environment variables from .env")
    load_dotenv(dotenv_path=ENV_PATH)

# ✅ Get DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your environment variables!")

# ✅ Fix Heroku's "postgres://" issue
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"✅ Using DATABASE_URL: {DATABASE_URL}")

# ✅ Create database engine
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Import Base AFTER defining engine
from app.db.base import Base  # ✅ Use Base from base.py to prevent conflicts

# ✅ Import models AFTER Base is defined
from app.models import *  # ✅ Ensure all models are imported

# ✅ Ensure tables are created in "public" schema
metadata = MetaData(schema="public")
Base.metadata.schema = "public"  # ✅ Explicitly set schema
print("🔄 Creating tables if they don't exist...")
Base.metadata.create_all(bind=engine)  # ✅ Create tables after all models are loaded
print("✅ Tables successfully created.")

# ✅ Dependency function to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
