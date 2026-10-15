"""Schemas for Career Copilot Chat endpoint."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Message author role: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, description="Chat history list")
    resume_text: str = Field(default="", description="Candidate resume text")
    jd_text: str = Field(default="", description="Target job description text")
    analysis_results: Optional[Dict[str, Any]] = Field(default=None, description="Previous analysis result context")
    api_key: Optional[str] = Field(default=None, description="Optional Gemini API key")
