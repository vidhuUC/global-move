# backend/config/settings.py
import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings - ADD MORE ORIGINS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",  
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:8080", 
        "*",  # Temporarily allow all for debugging (REMOVE in production)
    ]

    # OpenAI API settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
