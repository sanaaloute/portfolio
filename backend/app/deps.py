from __future__ import annotations
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import AsyncSessionLocal
from app.security import decode_token

security = HTTPBearer(auto_error=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


def _extract_token(request: Request, credentials: HTTPAuthorizationCredentials | None) -> str | None:
    cookie = request.cookies.get(settings.COOKIE_NAME)
    if cookie:
        return cookie
    if credentials:
        return credentials.credentials
    return None


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    token = _extract_token(request, credentials)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    payload = decode_token(token)
    if not payload or payload.get("sub") != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"sub": "admin"}
