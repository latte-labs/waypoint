from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.api.user_api import router as user_router  # ✅ Import correctly
from app.api.quiz_api import router as quiz_router  # ✅ Ensure correct import
from app.config.config import settings
from app.db.db import SessionLocal
from sqlalchemy.sql import text  # ✅ Import `text`

app = FastAPI()

# Include API routes
app.include_router(user_router)
app.include_router(quiz_router)  # ✅ Ensure quiz_router is used here

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# ✅ Health Check Endpoint
@app.get("/healthcheck")
def healthcheck():
    return {"status": "FastAPI is running!"}

# ✅ Fix: Use `text()` to wrap raw SQL
@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT current_database();"))  # ✅ Wrap SQL in `text()`
        return {"Connected to database": result.fetchone()[0]}
    except Exception as e:
        return {"error": str(e)}

import os
import uvicorn

# ✅ Ensure Uvicorn runs with Heroku's $PORT
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Default to 8000 if PORT is not set
    uvicorn.run(app, host="0.0.0.0", port=port)