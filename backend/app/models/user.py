"""User database model for authentication and history management."""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), default="")
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    auth_provider = Column(String(50), default="local")  # "local" | "google"
    google_id = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to user's saved resume scans
    scans = relationship("ResumeScan", back_populates="user", cascade="all, delete-orphan", order_by="desc(ResumeScan.created_at)")
