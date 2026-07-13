from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, JSON
from sqlalchemy.sql import func

from app.db import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, default=1)
    name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=False)
    tagline = Column(Text, nullable=False)
    bio = Column(Text, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    resume_url = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False)
    github = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    twitter = Column(String(255), nullable=True)
    hero_stats = Column(JSON, nullable=False, default=lambda: [])
    focus_areas = Column(JSON, nullable=False, default=lambda: [])
    socials = Column(JSON, nullable=True, default=lambda: [])
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
    period = Column(String(100), nullable=False)
    location = Column(String(255), nullable=True)
    stack = Column(JSON, nullable=False, default=lambda: [])
    cover_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    images = Column(JSON, nullable=True, default=lambda: [])
    featured = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=_now)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), default=_now)


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=False)
    highlights = Column(JSON, nullable=False, default=lambda: [])
    stack = Column(JSON, nullable=True, default=lambda: [])
    logo_url = Column(String(500), nullable=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=_now)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), default=_now)


class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    cover_url = Column(String(500), nullable=True)
    published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=_now)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), default=_now)


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=_now)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), default=_now)


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    year = Column(String(20), nullable=True)
    url = Column(String(500), nullable=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=_now)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), default=_now)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=_now)
