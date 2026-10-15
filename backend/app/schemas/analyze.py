"""Schemas for Resume Analysis endpoint."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=1, description="Raw or parsed resume text")
    jd_text: str = Field(..., min_length=1, description="Target job description text")
    job_title: Optional[str] = Field(default="", description="Optional target job title")
    api_key: Optional[str] = Field(default=None, description="Optional Google Gemini API key")


class ContactInfoSchema(BaseModel):
    name: Optional[str] = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
