from __future__ import annotations
import warnings
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Placeholder values that must never be used as a real signing secret.
_INSECURE_SECRETS = {
    "change-me-to-a-long-random-string-min-32-chars",
    "change-me-to-a-long-random-string-min-32-characters",
    "your-secure-admin-password",
    "secret",
    "changeme",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # one week

    COOKIE_NAME: str = "portfolio_token"
    COOKIE_SECURE: bool = False  # set True behind HTTPS in production

    # For production, prefer ADMIN_PASSWORD_HASH (bcrypt). For dev, ADMIN_PASSWORD plaintext is accepted.
    ADMIN_PASSWORD: str | None = None
    ADMIN_PASSWORD_HASH: str | None = None

    CORS_ORIGINS: str = "http://localhost:8080"  # comma-separated; override to the real origin in prod

    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent / "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 MB

    @field_validator("JWT_SECRET")
    @classmethod
    def _check_jwt_secret(cls, v: str) -> str:
        if not v or len(v) < 32 or v in _INSECURE_SECRETS:
            raise ValueError(
                "JWT_SECRET must be set to a strong random value of at least 32 characters "
                "(not the example placeholder)."
            )
        return v

    def __init__(self, **data):
        super().__init__(**data)
        if not self.ADMIN_PASSWORD and not self.ADMIN_PASSWORD_HASH:
            warnings.warn(
                "Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set; admin login will always fail.",
                stacklevel=2,
            )
        elif self.ADMIN_PASSWORD and not self.ADMIN_PASSWORD_HASH:
            warnings.warn(
                "Using plaintext ADMIN_PASSWORD. Set ADMIN_PASSWORD_HASH (bcrypt) for production.",
                stacklevel=2,
            )


settings = Settings()
