from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import Blog
from app.schemas import BlogCreate, BlogResponse, BlogUpdate
from app.utils import ensure_unique_slug, sanitize_slug

router = APIRouter()


@router.get("", response_model=list[BlogResponse])
async def list_blogs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Blog).where(Blog.published == True).order_by(Blog.created_at.desc())
    )
    return result.scalars().all()


@router.get("/all", response_model=list[BlogResponse])
async def list_all_blogs(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Blog).order_by(Blog.created_at.desc()))
    return result.scalars().all()


@router.get("/{slug}", response_model=BlogResponse)
async def get_blog(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).where(Blog.slug == slug, Blog.published == True))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.post("", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(
    payload: BlogCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    data = payload.model_dump()
    base = data.get("slug") or sanitize_slug(data["title"])
    data["slug"] = await ensure_unique_slug(db, Blog, base)
    if data.get("published"):
        data["published_at"] = datetime.now(timezone.utc)
    blog = Blog(**data)
    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    return blog


@router.put("/{slug}", response_model=BlogResponse)
async def update_blog(
    slug: str,
    payload: BlogUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Blog).where(Blog.slug == slug))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != blog.slug:
        data["slug"] = await ensure_unique_slug(
            db,
            Blog,
            data["slug"] or sanitize_slug(data.get("title", blog.title)),
            exclude_id=blog.id,
        )
    if data.get("published") and not blog.published_at:
        data["published_at"] = datetime.now(timezone.utc)
    elif data.get("published") is False:
        data["published_at"] = None
    for key, value in data.items():
        setattr(blog, key, value)
    await db.commit()
    await db.refresh(blog)
    return blog


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Blog).where(Blog.slug == slug))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    await db.delete(blog)
    await db.commit()
    return None
