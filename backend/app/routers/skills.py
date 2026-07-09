from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, get_db
from app.models import Skill
from app.schemas import SkillCreate, SkillGroup, SkillResponse, SkillUpdate

router = APIRouter()


@router.get("", response_model=list[SkillGroup])
async def list_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill).order_by(Skill.position, Skill.name))
    rows = result.scalars().all()
    groups: dict[str, list[str]] = {}
    for row in rows:
        groups.setdefault(row.category, []).append(row.name)
    return [SkillGroup(category=k, items=v) for k, v in groups.items()]


@router.get("/raw", response_model=list[SkillResponse])
async def list_raw_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Skill).order_by(Skill.category, Skill.position, Skill.name))
    return result.scalars().all()


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    payload: SkillCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    skill = Skill(**payload.model_dump())
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: int,
    payload: SkillUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(skill, key, value)
    await db.commit()
    await db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    await db.delete(skill)
    await db.commit()
    return None
