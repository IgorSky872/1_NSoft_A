from typing import Optional
from app.models.auth_models import UserInDB
from app.auth.utils import verify_password

# Правильный хеш для пароля "secret"
# Получен через: pwd_context.hash("secret")
FAKE_USERS_DB = {
    "admin": {
        "username": "admin",
        "hashed_password": "$2b$12$kh/7Ta7nQy1pJqkpaZHjBOZpthdAikAWnLKtMLW5l3TzFnTLzPV2e",
        "role": "admin",
    }
}


def get_user_from_db(username: str) -> Optional[UserInDB]:
    print(f"DEBUG: Looking for user '{username}'")
    print(f"DEBUG: Available users: {list(FAKE_USERS_DB.keys())}")

    if username in FAKE_USERS_DB:
        user_dict = FAKE_USERS_DB[username]
        print(f"DEBUG: Found user: {user_dict}")
        return UserInDB(**user_dict)

    print("DEBUG: User not found")
    return None


def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    print(f"DEBUG: Auth attempt for '{username}' with password '{password}'")

    user = get_user_from_db(username)
    if not user:
        print("DEBUG: No user found")
        return None

    print(f"DEBUG: User found: {user.username}")
    print(f"DEBUG: Stored hash: {user.hashed_password}")

    is_valid = verify_password(password, user.hashed_password)
    print(f"DEBUG: Password valid: {is_valid}")

    if not is_valid:
        return None

    return user