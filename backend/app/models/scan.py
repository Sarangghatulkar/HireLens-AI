"""Resume Scan database model for recording evaluation history and score trends."""

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class ResumeScan(Base):
    __tablename__ = "resume_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    candidate_name = Column(String(255), default="Candidate")
    job_title = Column(String(255), default="Target Role")

    # Match scores
    overall_score = Column(Float, default=0.0)
    tier_label = Column(String(100), default="Evaluation")
    skill_score = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    keyword_score = Column(Float, default=0.0)
    ats_score = Column(Float, default=0.0)

    # Core skill highlights (JSON structured)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    bonus_skills = Column(JSON, default=list)

    # Snippets
    resume_snippet = Column(Text, default="")
    jd_snippet = Column(Text, default="")

    # Full JSON payload for complete re-hydration of past scans
    full_results_json = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationship to user
    user = relationship("User", back_populates="scans")
