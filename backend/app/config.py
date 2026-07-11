from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "FaceVision AI Authentication & Authorization Suite"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "supersecretkey_replace_in_production_with_at_least_32_characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres_secure_password@localhost:5432/facevision_auth"
    
    # Cache / Redis (Used for session tracking, rate limiting, and OTP blacklisting)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Mail Config (For Password Resets & Verification)
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = "noreply@facevision.ai"
    SMTP_PASSWORD: Optional[str] = "app_specific_secure_password_here"
    EMAILS_FROM_EMAIL: str = "security@facevision.ai"
    
    # OTP / 2FA Settings
    OTP_ISSUER_NAME: str = "FaceVisionAI"
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
