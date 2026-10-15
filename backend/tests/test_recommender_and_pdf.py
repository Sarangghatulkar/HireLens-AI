"""Unit tests for rule recommendations and PDF report generation."""

from app.services.pdf_report import generate_pdf_report
from app.services.recommender import generate_rule_based_recommendations


def test_generate_rule_based_recommendations(sample_resume_text: str, sample_jd_text: str):
    mock_skill_comp = {
        "matched_skills": ["Python", "FastAPI"],
        "missing_skills": ["Kubernetes", "AWS"],
    }
    mock_ats_audit = {
        "sections_check": {"Summary / Objective": False, "Experience": True, "Education": True},
        "contact_check": {"has_email": True, "has_link": True},
        "weak_phrases_found": ["responsible for"],
        "metrics_found": ["35%"],
    }

    recs = generate_rule_based_recommendations(
        skill_comparison=mock_skill_comp,
        ats_audit=mock_ats_audit,
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
    )

    assert "critical_fixes" in recs
    assert "skill_enhancements" in recs
    assert "polish_tips" in recs
    assert recs["total_recommendations"] >= 3

    # Missing summary should be identified as a fix
    assert any("Summary" in f["title"] for f in recs["critical_fixes"])
    # Missing skills should be in enhancements
    assert any("Kubernetes" in e["title"] for e in recs["skill_enhancements"])


def test_generate_pdf_report_bytes():
    score_data = {
        "overall_score": 85.0,
        "tier_label": "Outstanding Match",
        "tier_desc": "High compatibility",
        "sub_scores": {"skill_score": 80, "semantic_score": 90, "keyword_score": 80},
    }
    skill_data = {
        "matched_skills": ["Python", "FastAPI", "Docker"],
        "missing_skills": ["Kubernetes"],
    }
    ats_data = {
        "ats_score": 88.0,
        "checklist": [
            {"item": "Work Experience Section", "passed": True, "detail": "Found"},
            {"item": "Email Address", "passed": True, "detail": "Found"},
        ],
    }
    recommendations = {
        "critical_fixes": [],
        "skill_enhancements": [{"title": "Add Kubernetes", "desc": "Important for role", "impact": "+10%"}],
    }

    pdf_bytes = generate_pdf_report(
        candidate_name="Jane Doe",
        job_title="Senior Backend Engineer",
        score_data=score_data,
        skill_data=skill_data,
        ats_data=ats_data,
        recommendations=recommendations,
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")
