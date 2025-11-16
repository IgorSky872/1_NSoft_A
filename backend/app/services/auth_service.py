# backend/app/services/auth_service.py

from app.auth.utils import get_password_hash, verify_password

# Ленивая инициализация (чтобы не хэшировать при старте)
_users_db = None

def get_users_db():
    global _users_db
    if _users_db is None:
        _users_db = {"test": get_password_hash("test")}
    return _users_db

def authenticate_user(username: str, password: str):
    users_db = get_users_db()
    hashed = users_db.get(username)
    if hashed and verify_password(password, hashed):
        return {"sub": username}
    return None