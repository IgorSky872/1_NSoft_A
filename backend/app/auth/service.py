from typing import Optional
from app.models.auth_models import UserInDB
from app.auth.utils import verify_password

# Мок данные для тестирования
FAKE_USERS_DB = {
    "admin": {
        "username": "admin",
        "hashed_password": "$2b$12$KIXpS8vKQM2v2aT3lZQ6TOp.vxIqbDjqEJLZKiSAeE1J8XcM8J8ue",  # password: "secret"
        "role": "admin",
    }
}

def get_user_from_db(username: str) -> Optional[UserInDB]:
    if username in FAKE_USERS_DB:
        user_dict = FAKE_USERS_DB[username]
        return UserInDB(**user_dict)
    return None

def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = get_user_from_db(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user