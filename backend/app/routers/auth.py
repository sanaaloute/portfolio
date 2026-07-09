from __future__ import annotations
from fastapi import APIRouter, HTTPException, status

from app.schemas import LoginRequest, TokenResponse
from app.security import create_access_token, verify_admin_password

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    if not verify_admin_password(payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": "admin"})
    return {"access_token": token}
