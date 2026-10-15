"""Integration tests for all FastAPI REST API routes."""

import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "HireLens AI Backend API is running" in data["message"]


def test_analyze_endpoint(sample_resume_text: str, sample_jd_text: str):
    payload = {
        "resume_text": sample_resume_text,
        "jd_text": sample_jd_text,
        "job_title": "Senior Python Backend Engineer",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "score_data" in data
    assert 0 <= data["score_data"]["overall_score"] <= 100
    assert "skill_comparison" in data
    assert "Python" in data["skill_comparison"]["matched_skills"]
    assert "ats_audit" in data
    assert data["ats_audit"]["ats_score"] > 50


def test_analyze_empty_request():
    response = client.post("/api/analyze", json={"resume_text": "", "jd_text": ""})
    assert response.status_code in [400, 422]


def test_chat_endpoint(sample_resume_text: str, sample_jd_text: str):
    payload = {
        "messages": [{"role": "user", "content": "What are my missing skills?"}],
        "resume_text": sample_resume_text,
        "jd_text": sample_jd_text,
        "analysis_results": {
            "score_data": {"overall_score": 75.0},
            "skill_comparison": {"matched_skills": ["Python"], "missing_skills": ["Kubernetes"]},
            "ats_audit": {"status": "Good", "ats_score": 80},
        },
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 0


def test_upload_resume_endpoint_txt():
    file_content = b"Jane Doe\nExperienced Python developer skilled in Docker and AWS."
    files = {"file": ("resume.txt", io.BytesIO(file_content), "text/plain")}
    response = client.post("/api/upload-resume", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Python" in data["text"]
    assert data["word_count"] > 5


def test_download_report_endpoint():
    payload = {
        "candidate_name": "Jane Doe",
        "job_title": "Senior Python Engineer",
        "score_data": {
            "overall_score": 85.0,
            "tier_label": "Outstanding Match",
            "tier_desc": "High compatibility",
            "sub_scores": {"skill_score": 85, "semantic_score": 85, "keyword_score": 80},
        },
        "skill_data": {
            "matched_skills": ["Python", "FastAPI"],
            "missing_skills": ["Kubernetes"],
        },
        "ats_data": {
            "ats_score": 90.0,
            "checklist": [{"item": "Email Address", "passed": True, "detail": "Valid email detected"}],
        },
        "recommendations": {
            "critical_fixes": [],
            "skill_enhancements": [],
            "polish_tips": [],
        },
    }
    response = client.post("/api/download-report", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
