"""Security, sanitization, and PII protection utilities."""

import re
from typing import Optional
from app.core.config import settings


def sanitize_text(text: Optional[str]) -> str:
    """Strips leading/trailing whitespace and removes dangerous control characters."""
    if not text:
        return ""
    # Strip non-printable ASCII except common whitespace/newlines
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    return cleaned.strip()


def mask_candidate_pii(text: str) -> str:
    """Masks emails and phone numbers in text for privacy protection."""
    if not text:
        return ""

    # Mask email addresses
    masked = re.sub(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        "[PROTECTED_EMAIL]",
        text,
    )

    # Mask phone numbers (US/Intl formats)
    masked = re.sub(
        r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        "[PROTECTED_PHONE]",
        masked,
    )

    return masked


def resolve_api_key(client_key: Optional[str] = None) -> str:
    """Resolves API key, prioritizing client request over server environment.
    
    Filters out placeholder or dummy keys to prevent slow failing network calls.
    """
    key = client_key.strip() if client_key and client_key.strip() else settings.GEMINI_API_KEY.strip()
    if not key or key.lower() in {"your_gemini_api_key_here", "none", "null", "undefined"} or key.startswith("AQ."):
        return ""
    return key

