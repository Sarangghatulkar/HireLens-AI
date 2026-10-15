"""Application configuration and environment settings."""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()


class Settings:
    PROJECT_NAME: str = "HireLens AI API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Enterprise Resume Analyzer, Job Matcher & AI Career Copilot REST API"

    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Google Gemini API Key (optional, defaults to empty string)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

    # CORS origins
    _raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
    )
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in _raw_origins.split(",") if origin.strip()
    ]
    if not CORS_ORIGINS:
        CORS_ORIGINS = ["*"]


settings = Settings()
