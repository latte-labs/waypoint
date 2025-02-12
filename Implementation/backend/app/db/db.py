from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from pathlib import Path
import os

# ✅ Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
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

# ✅ Define Base (before importing models)
Base = declarative_base(metadata=MetaData(schema="public"))  # ✅ Ensure tables go into 'public'

# ✅ Import models AFTER defining Base
from app.models import *  # Avoids circular import

# ✅ Create tables
print("🔄 Creating tables if they don't exist...")
Base.metadata.create_all(bind=engine)
print("✅ Tables successfully created.")

# ✅ Dependency function to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
