"""Authentication request and response schemas."""

import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    full_name: Optional[str] = Field(default="", description="User full name")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email format")
        return clean


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email format")
        return clean


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: Optional[str] = ""
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = Field(default=None, description="Google OAuth ID Token or JWT")
    email: Optional[str] = Field(default=None, description="User verified email from Google")
    name: Optional[str] = Field(default=None, description="User full name from Google")
    google_id: Optional[str] = Field(default=None, description="Google unique account ID")


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Registered account email")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email format")
        return clean


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1, description="Password reset token")
    new_password: str = Field(..., min_length=6, description="New account password (min 6 characters)")


class MessageResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None
