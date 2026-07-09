from __future__ import annotations
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


def sanitize_slug(text: str) -> str:
    return slugify(text or "untitled", max_length=100)


async def ensure_unique_slug(session: AsyncSession, model, base_slug: str, exclude_id: int | None = None) -> str:
    slug = sanitize_slug(base_slug)
    counter = 1
    original = slug
    while True:
        stmt = select(model).where(model.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(model.id != exclude_id)
        result = await session.execute(stmt)
        if result.scalar_one_or_none() is None:
            return slug
        counter += 1
        slug = f"{original}-{counter}"
