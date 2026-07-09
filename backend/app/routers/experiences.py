from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import Experience
from app.schemas import ExperienceCreate, ExperienceResponse, ExperienceUpdate
from app.utils import ensure_unique_slug, sanitize_slug

router = APIRouter()


@router.get("", response_model=list[ExperienceResponse])
async def list_experiences(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Experience).order_by(Experience.position, Experience.start_date.desc()))
    return result.scalars().all()


@router.get("/{slug}", response_model=ExperienceResponse)
async def get_experience(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Experience).where(Experience.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Experience not found")
    return item


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
async def create_experience(
    payload: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    data = payload.model_dump()
    base = data.get("slug") or sanitize_slug(f"{data['role']}-{data['company']}")
    data["slug"] = await ensure_unique_slug(db, Experience, base)
    item = Experience(**data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{slug}", response_model=ExperienceResponse)
async def update_experience(
    slug: str,
    payload: ExperienceUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Experience).where(Experience.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Experience not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != item.slug:
        title = sanitize_slug(data["slug"]) or sanitize_slug(
            f"{data.get('role', item.role)}-{data.get('company', item.company)}"
        )
        data["slug"] = await ensure_unique_slug(db, Experience, title, exclude_id=item.id)
    for key, value in data.items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experience(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Experience).where(Experience.slug == slug))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Experience not found")
    await db.delete(item)
    await db.commit()
    return None
