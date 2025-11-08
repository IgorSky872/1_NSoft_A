# backend/app/services/auth_service.py

from app.utils.jwt_utils import hash_password, verify_password, create_access_token

# Ленивая инициализация (чтобы не хэшировать при старте)
_users_db = None

def get_users_db():
    global _users_db
    if _users_db is None:
        _users_db = {"test": hash_password("test")}
    return _users_db

def authenticate_user(username: str, password: str):
    users_db = get_users_db()
    hashed = users_db.get(username)
    if hashed and verify_password(password, hashed):
        return {"sub": username}
    return None