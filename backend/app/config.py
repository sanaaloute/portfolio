from __future__ import annotations
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # one week

    # For production, prefer ADMIN_PASSWORD_HASH (bcrypt). For dev, ADMIN_PASSWORD plaintext is accepted.
    ADMIN_PASSWORD: str | None = None
    ADMIN_PASSWORD_HASH: str | None = None

    CORS_ORIGINS: str = "*"  # comma-separated; "*" for any

    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent / "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 MB

    OPENAI_API_KEY: str | None = None


settings = Settings()
