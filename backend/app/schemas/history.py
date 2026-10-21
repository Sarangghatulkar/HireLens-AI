"""Schemas for scan history tracking and progression analytics."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class ScanSummaryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_name: str
    job_title: str
    overall_score: float
    tier_label: str
    skill_score: float
    ats_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    created_at: Optional[datetime] = None


class HistoryProgressionResponse(BaseModel):
    scans: List[ScanSummaryItem]
    total_scans: int
    average_score: float
    highest_score: float
    score_improvement: float = 0.0  # Difference between latest and earliest scan
