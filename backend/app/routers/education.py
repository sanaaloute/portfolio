from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import Education
from app.schemas import EducationCreate, EducationResponse, EducationUpdate
from app.utils import ensure_unique_slug, sanitize_slug

router = APIRouter()


@router.get("", response_model=list[EducationResponse])
async def list_education(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Education).order_by(Education.position, Education.start_date.desc()))
    return result.scalars().all()


@router.get("/{slug}", response_model=EducationResponse)
async def get_education(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Education).where(Education.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Education not found")
    return item


@router.post("", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
async def create_education(
    payload: EducationCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    data = payload.model_dump()
    base = data.get("slug") or sanitize_slug(f"{data['degree']}-{data['institution']}")
    data["slug"] = await ensure_unique_slug(db, Education, base)
    item = Education(**data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{slug}", response_model=EducationResponse)
async def update_education(
    slug: str,
    payload: EducationUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Education).where(Education.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Education not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != item.slug:
        title = sanitize_slug(data["slug"]) or sanitize_slug(
            f"{data.get('degree', item.degree)}-{data.get('institution', item.institution)}"
        )
        data["slug"] = await ensure_unique_slug(db, Education, title, exclude_id=item.id)
    for key, value in data.items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_education(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Education).where(Education.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Education not found")
    await db.delete(item)
    await db.commit()
    return None
