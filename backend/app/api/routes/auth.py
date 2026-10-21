import base64
import json
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user and returns an authenticated JWT access token."""
    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    hashed_pw = get_password_hash(req.password)
    user = User(
        email=req.email.lower().strip(),
        full_name=req.full_name.strip() if req.full_name else "",
        hashed_password=hashed_pw,
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates user credentials and returns a JWT access token."""
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/google", response_model=TokenResponse)
def google_auth_login(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticates or signs up a user via Google OAuth."""
    email = req.email
    name = req.name
    google_id = req.google_id

    # If a Google JWT credential was provided, extract payload
    if req.credential and "." in req.credential:
        try:
            parts = req.credential.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1]
                payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
                payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode("utf-8"))
                email = payload.get("email") or email
                name = payload.get("name") or name
                google_id = payload.get("sub") or google_id
        except Exception:
            pass

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid email address is required for Google Sign-In.",
        )

    clean_email = email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()

    if user:
        if not user.google_id and google_id:
            user.google_id = google_id
        if name and not user.full_name:
            user.full_name = name.strip()
        user.auth_provider = "google" if user.auth_provider == "local" else user.auth_provider
        db.commit()
        db.refresh(user)
    else:
        # Create new Google authenticated user
        random_pw = secrets.token_hex(24)
        user = User(
            email=clean_email,
            full_name=name.strip() if name else clean_email.split("@")[0].capitalize(),
            hashed_password=get_password_hash(random_pw),
            auth_provider="google",
            google_id=google_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/forgot-password", response_model=MessageResponse)
def request_password_reset(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a secure password reset token for account recovery."""
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user:
        # Prevent user enumeration attack by returning generic confirmation
        return MessageResponse(
            message="If an account exists with this email, password reset instructions have been generated."
        )

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=45)
    db.commit()

    return MessageResponse(
        message="Password reset token generated successfully.",
        reset_token=reset_token,
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_user_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Validates the reset token and updates the user's password."""
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    if user.reset_token_expires:
        expires = user.reset_token_expires
        if expires.tzinfo is None:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
        else:
            now = datetime.now(timezone.utc)
        if now > expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has expired. Please request a new one.",
            )

    user.hashed_password = get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return MessageResponse(
        message="Your password has been successfully updated. You can now sign in with your new credentials."
    )


@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile details."""
    return UserResponse.model_validate(current_user)
