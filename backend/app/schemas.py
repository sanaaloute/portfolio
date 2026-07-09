from __future__ import annotations
from datetime import date, datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class ProfileBase(BaseModel):
    name: str
    headline: str
    tagline: str
    bio: str
    avatar_url: str | None = None
    resume_url: str | None = None
    location: str | None = None
    email: str
    github: str | None = None
    linkedin: str | None = None
    twitter: str | None = None
    hero_stats: list[dict[str, Any]] = Field(default_factory=list)
    focus_areas: list[dict[str, Any]] = Field(default_factory=list)
    socials: list[dict[str, Any]] = Field(default_factory=list)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: str | None = None
    headline: str | None = None
    tagline: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    resume_url: str | None = None
    location: str | None = None
    email: str | None = None
    github: str | None = None
    linkedin: str | None = None
    twitter: str | None = None
    hero_stats: list[dict[str, Any]] | None = None
    focus_areas: list[dict[str, Any]] | None = None
    socials: list[dict[str, Any]] | None = None


class ProfileResponse(ProfileBase):
    id: int
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    slug: str | None = None
    title: str
    summary: str
    body: str
    period: str
    location: str | None = None
    stack: list[str] = Field(default_factory=list)
    cover_url: str | None = None
    images: list[dict[str, Any]] = Field(default_factory=list)
    featured: bool = False
    position: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    summary: str | None = None
    body: str | None = None
    period: str | None = None
    location: str | None = None
    stack: list[str] | None = None
    cover_url: str | None = None
    images: list[dict[str, Any]] | None = None
    featured: bool | None = None
    position: int | None = None


class ProjectResponse(ProjectBase):
    id: int
    slug: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class ExperienceBase(BaseModel):
    slug: str | None = None
    company: str
    role: str
    location: str | None = None
    start_date: date
    end_date: date | None = None
    description: str
    highlights: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    logo_url: str | None = None
    position: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    slug: str | None = None
    company: str | None = None
    role: str | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None
    highlights: list[str] | None = None
    stack: list[str] | None = None
    logo_url: str | None = None
    position: int | None = None


class ExperienceResponse(ExperienceBase):
    id: int
    slug: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class BlogBase(BaseModel):
    slug: str | None = None
    title: str
    summary: str | None = None
    body: str
    cover_url: str | None = None
    published: bool = False


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    summary: str | None = None
    body: str | None = None
    cover_url: str | None = None
    published: bool | None = None


class BlogResponse(BlogBase):
    id: int
    slug: str
    published_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class SkillBase(BaseModel):
    category: str
    name: str
    position: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    category: str | None = None
    name: str | None = None
    position: int | None = None


class SkillResponse(SkillBase):
    id: int
    created_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class SkillGroup(BaseModel):
    category: str
    items: list[str]


class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChatQuery(BaseModel):
    query: str


class ChatResponse(BaseModel):
    answer: str
    confidence: float
