from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.config import settings
from app.deps import get_current_user
from app.limiter import limiter
from app.schemas import LoginRequest
from app.security import create_access_token, verify_admin_password

router = APIRouter()


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest, response: Response):
    if not verify_admin_password(payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": "admin"})
    _set_auth_cookie(response, token)
    return {"ok": True}


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {"sub": user["sub"]}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.COOKIE_NAME, path="/")
    return {"ok": True}
