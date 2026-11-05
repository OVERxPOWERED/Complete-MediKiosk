from typing import Annotated, Any

from pydantic import (
    AnyUrl,
    BeforeValidator,
    Field,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database
    DATABASE_URL: PostgresDsn = Field(
        default="postgresql://postgres:postgres@localhost:5432/doctor",
        description="PostgreSQL connection URL",
    )

    # Security
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production-min-32-chars",
        description="Secret key for JWT signing and encryption",
        min_length=32,
    )

    # Application
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    ALLOWED_HOSTS: Annotated[list[str], BeforeValidator(parse_cors)] = Field(
        default=["localhost", "127.0.0.1"],
        description="Allowed hosts for the application",
    )
    CORS_ORIGINS: Annotated[list[str], BeforeValidator(parse_cors)] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        description="CORS allowed origins",
    )

    # Redis
    REDIS_URL: str | None = Field(
        default=None,
        description="Redis connection URL for caching and sessions",
    )

    # API
    API_V1_PREFIX: str = Field(default="/api/v1", description="API version prefix")
    PROJECT_NAME: str = Field(default="Doctor Backend", description="Project name")

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30, description="Access token expiration in minutes"
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7, description="Refresh token expiration in days"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")

    # Email (optional)
    SMTP_HOST: str | None = Field(default=None, description="SMTP host")
    SMTP_PORT: int | None = Field(default=None, description="SMTP port")
    SMTP_USER: str | None = Field(default=None, description="SMTP username")
    SMTP_PASSWORD: str | None = Field(default=None, description="SMTP password")
    EMAILS_FROM_EMAIL: str | None = Field(default=None, description="From email address")
    EMAILS_FROM_NAME: str | None = Field(default=None, description="From name")

    # Celery
    CELERY_BROKER_URL: str | None = Field(default=None, description="Celery broker URL")
    CELERY_RESULT_BACKEND: str | None = Field(
        default=None, description="Celery result backend"
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url_sync(self) -> str:
        """Return synchronous database URL for migrations."""
        return str(self.DATABASE_URL).replace("postgresql+asyncpg", "postgresql")

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        """Return all CORS origins including allowed hosts."""
        origins = self.CORS_ORIGINS.copy()
        for host in self.ALLOWED_HOSTS:
            if host not in origins:
                origins.append(f"http://{host}")
                origins.append(f"https://{host}")
        return origins

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """Validate production-specific requirements."""
        if not self.DEBUG:
            # In production, enforce strong secret key
            if len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "SECRET_KEY must be at least 32 characters in production"
                )
            if self.SECRET_KEY == "dev-secret-key-change-in-production-min-32-chars":
                raise ValueError("SECRET_KEY must be changed from default in production")

            # Ensure HTTPS origins in production
            for origin in self.CORS_ORIGINS:
                if origin.startswith("http://") and "localhost" not in origin:
                    raise ValueError(
                        f"CORS origin {origin} must use HTTPS in production"
                    )

            # Require Redis in production
            if self.REDIS_URL is None:
                raise ValueError("REDIS_URL is required in production")

        return self

    @model_validator(mode="after")
    def validate_database_url(self) -> "Settings":
        """Ensure database URL uses asyncpg driver."""
        url_str = str(self.DATABASE_URL)
        if not url_str.startswith("postgresql+asyncpg://"):
            # Auto-fix if using standard postgresql://
            if url_str.startswith("postgresql://"):
                object.__setattr__(
                    self, "DATABASE_URL", url_str.replace("postgresql://", "postgresql+asyncpg://", 1)
                )
        return self


settings = Settings()