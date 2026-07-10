from __future__ import annotations
import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.config import settings
from app.deps import get_current_user

router = APIRouter()

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_RESUME_TYPES = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}


def _upload_path(filename: str) -> Path:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = (settings.UPLOAD_DIR / filename).resolve()
    if not str(path).startswith(str(settings.UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Invalid filename")
    return path


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {content_type}")

    ext = Path(file.filename or "file").suffix.lstrip(".") or "jpg"
    if ext.lower() == "jpeg":
        ext = "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = _upload_path(filename)

    total = 0
    async with aiofiles.open(path, "wb") as out:
        while chunk := await file.read(8192):
            total += len(chunk)
            if total > settings.MAX_UPLOAD_SIZE:
                path.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File too large")
            await out.write(chunk)

    return {"url": f"/uploads/{filename}", "filename": filename}


@router.post("/resume", status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), user=Depends(get_current_user)):
    content_type = file.content_type or ""
    if content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {content_type}")

    ext = Path(file.filename or "").suffix.lstrip(".").lower()
    if ext not in {"pdf", "doc", "docx"}:
        ext = ALLOWED_RESUME_TYPES[content_type]
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = _upload_path(filename)

    total = 0
    async with aiofiles.open(path, "wb") as out:
        while chunk := await file.read(8192):
            total += len(chunk)
            if total > settings.MAX_UPLOAD_SIZE:
                path.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File too large")
            await out.write(chunk)

    return {"url": f"/uploads/{filename}", "filename": filename}


@router.get("/images")
async def list_images(user=Depends(get_current_user)):
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(settings.UPLOAD_DIR.iterdir())
    return [
        {"url": f"/uploads/{f.name}", "filename": f.name}
        for f in files
        if f.is_file()
    ]


@router.delete("/images/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(filename: str, user=Depends(get_current_user)):
    path = _upload_path(filename)
    path.unlink(missing_ok=True)
    return None
