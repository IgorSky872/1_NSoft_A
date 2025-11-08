from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str  # Hashed in DB

class Token(BaseModel):
    access_token: str
    token_type: str