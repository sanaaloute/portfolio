from __future__ import annotations
import hmac
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_admin_password(plain_password: str) -> bool:
    if settings.ADMIN_PASSWORD_HASH:
        return pwd_context.verify(plain_password, settings.ADMIN_PASSWORD_HASH)
    if settings.ADMIN_PASSWORD:
        return hmac.compare_digest(plain_password, settings.ADMIN_PASSWORD)
    return False


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python -m app.security <password>")
        sys.exit(1)
    print(get_password_hash(sys.argv[1]))
