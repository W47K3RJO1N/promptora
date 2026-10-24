"""
Configuration settings for the Promptora FastAPI backend.
Reads from environment variables with sensible local defaults.
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Promptora API"
    app_version: str = "1.0.0"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("OLLAMA_MODEL", "gemma3:4b")
    max_prompt_length: int = int(os.getenv("MAX_PROMPT_LENGTH", "25000"))
    timeout_seconds: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "90.0"))
    cors_origins: list[str] = ["*"]
    github_repo_url: str = os.getenv("GITHUB_REPO_URL", "https://github.com/tokenwise/tokenwise")

settings = Settings()
