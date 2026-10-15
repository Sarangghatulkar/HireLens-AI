"""Unit tests for scoring engine (TF-IDF, semantic similarity, match scores)."""

from app.services.scorer import (
    calculate_match_score,
    compute_semantic_similarity,
    compute_tfidf_similarity,
)


def test_tfidf_similarity_identical_texts():
    text = "Senior Python developer with experience in Django, FastAPI, and Docker."
    score = compute_tfidf_similarity(text, text)
    assert score >= 90.0


def test_tfidf_similarity_different_texts():
    text1 = "Chef specializing in Italian cuisine and pasta making."
    text2 = "DevOps engineer with Kubernetes and Terraform experience."
    score = compute_tfidf_similarity(text1, text2)
    assert score < 25.0


def test_compute_semantic_similarity():
    text1 = "Senior Machine Learning Engineer training deep neural networks and NLP models."
    text2 = "Lead AI Specialist developing transformer architectures and language algorithms."
    score = compute_semantic_similarity(text1, text2)
    assert score >= 50.0  # Contextually related titles and skills


def test_calculate_match_score():
    res_text = "Experienced Python developer with AWS and Docker skills."
    jd_text = "Looking for a Python engineer with AWS, Docker, and Kubernetes."

    mock_skill_comp = {
        "match_percentage": 75.0,
        "matched_count": 3,
        "total_required": 4,
    }
    mock_ats_audit = {
        "ats_score": 80.0,
    }

    result = calculate_match_score(res_text, jd_text, mock_skill_comp, mock_ats_audit)
    assert 0 <= result["overall_score"] <= 100
    assert result["tier_label"] in ["Outstanding Match", "Strong Match", "Moderate Match", "Low Alignment"]
    assert "sub_scores" in result
    assert "contribution_breakdown" in result
