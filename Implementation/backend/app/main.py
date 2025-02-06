from fastapi import FastAPI
from app.api.user_api import user_router
from app.config.config import settings

app = FastAPI()

# Include API routes
app.include_router(user_router)

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}
