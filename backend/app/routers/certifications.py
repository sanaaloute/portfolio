from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import Certification
from app.schemas import CertificationCreate, CertificationResponse, CertificationUpdate
from app.utils import ensure_unique_slug, sanitize_slug

router = APIRouter()


@router.get("", response_model=list[CertificationResponse])
async def list_certifications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certification).order_by(Certification.position, Certification.id))
    return result.scalars().all()


@router.get("/{slug}", response_model=CertificationResponse)
async def get_certification(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Certification).where(Certification.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Certification not found")
    return item


@router.post("", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
async def create_certification(
    payload: CertificationCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    data = payload.model_dump()
    base = data.get("slug") or sanitize_slug(f"{data['issuer']}-{data['name']}")
    data["slug"] = await ensure_unique_slug(db, Certification, base)
    item = Certification(**data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{slug}", response_model=CertificationResponse)
async def update_certification(
    slug: str,
    payload: CertificationUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Certification).where(Certification.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Certification not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != item.slug:
        title = sanitize_slug(data["slug"]) or sanitize_slug(
            f"{data.get('issuer', item.issuer)}-{data.get('name', item.name)}"
        )
        data["slug"] = await ensure_unique_slug(db, Certification, title, exclude_id=item.id)
    for key, value in data.items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certification(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Certification).where(Certification.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Certification not found")
    await db.delete(item)
    await db.commit()
    return None
