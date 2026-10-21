"""Integration tests for User Authentication, JWT tokens, and Scan History tracking."""

import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_auth_registration_and_login():
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "email": unique_email,
        "password": "securepassword123",
        "full_name": "Alex Mercer",
    }
    
    # 1. Register User
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code in [201, 400]  # 400 if test re-run with same DB
    
    # 2. Login User
    login_payload = {
        "email": unique_email,
        "password": "securepassword123",
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    assert token_data["user"]["email"] == unique_email

    # 3. Access Protected /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == unique_email

    # 4. Check Scan History (initially empty or list)
    hist_resp = client.get("/api/history/scans", headers=headers)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert "scans" in hist_data
    assert "score_improvement" in hist_data


def test_login_invalid_credentials():
    resp = client.post(
        "/api/auth/login",
        json={"email": "nonexistent_dev@example.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]


def test_protected_route_requires_token():
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_google_auth_flow():
    unique_email = f"google_user_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "name": "Sarah Connor",
        "google_id": "google_oauth_123456",
    }
    resp = client.post("/api/auth/google", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "Sarah Connor"


def test_forgot_and_reset_password_flow():
    unique_email = f"reset_test_{uuid.uuid4().hex[:8]}@example.com"
    reg_resp = client.post(
        "/api/auth/register",
        json={"email": unique_email, "password": "initialPassword123", "full_name": "Reset Tester"},
    )
    assert reg_resp.status_code == 201

    # 1. Request password reset
    forgot_resp = client.post("/api/auth/forgot-password", json={"email": unique_email})
    assert forgot_resp.status_code == 200
    forgot_data = forgot_resp.json()
    assert "reset_token" in forgot_data
    token = forgot_data["reset_token"]
    assert token is not None

    # 2. Reset password
    reset_resp = client.post(
        "/api/auth/reset-password",
        json={"token": token, "new_password": "newSuperPassword456"},
    )
    assert reset_resp.status_code == 200
    assert "successfully updated" in reset_resp.json()["message"]

    # 3. Old password should now fail
    old_login = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "initialPassword123"},
    )
    assert old_login.status_code == 401

    # 4. New password should succeed
    new_login = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": "newSuperPassword456"},
    )
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()
