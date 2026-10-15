"""Schemas for PDF Report Generation endpoint."""

from typing import Any, Dict
from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    candidate_name: str = Field(default="Candidate", description="Name of candidate")
    job_title: str = Field(default="Target Role", description="Job Title")
    score_data: Dict[str, Any] = Field(..., description="Overall score & breakdown")
    skill_data: Dict[str, Any] = Field(..., description="Skill comparison data")
    ats_data: Dict[str, Any] = Field(..., description="ATS compliance audit data")
    recommendations: Dict[str, Any] = Field(..., description="Recommendations dictionary")
