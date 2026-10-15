"""Unit tests for ATS compliance audit, power verbs, and metrics detection."""

from app.services.ats_checker import audit_ats_compliance


def test_audit_ats_compliance_complete_resume(sample_resume_text: str):
    audit = audit_ats_compliance(sample_resume_text)
    assert audit["ats_score"] >= 75.0
    assert audit["status"] in ["Excellent", "Good"]
    assert audit["action_verbs_count"] >= 3
    assert audit["metrics_count"] >= 3
    assert audit["word_count"] > 150
    assert len(audit["checklist"]) >= 8


def test_audit_ats_empty_resume():
    audit = audit_ats_compliance("")
    assert audit["ats_score"] == 0
    assert audit["status"] == "Incomplete"
