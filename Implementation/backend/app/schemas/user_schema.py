from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password_hash: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True
