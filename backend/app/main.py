from __future__ import annotations
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import Base, engine
from app.routers import auth, blogs, chat, experiences, profile, projects, skills, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tables are created by Alembic in production; this is a dev convenience.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Portfolio API",
    description="Backend for the redesigned personal portfolio.",
    version="2.0.0",
    lifespan=lifespan,
)

if settings.CORS_ORIGINS == "*":
    origins = ["*"]
else:
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=(origins != ["*"]),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(experiences.router, prefix="/api/experiences", tags=["experiences"])
app.include_router(skills.router, prefix="/api/skills", tags=["skills"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["blogs"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "portfolio-backend"}


@app.get("/")
async def root():
    return {
        "service": "Portfolio API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
    }
