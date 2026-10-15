"""Unit tests for AI Career Copilot context generation and offline responses."""

from app.services.chat_assistant import (
    build_system_context,
    chat_with_copilot,
    generate_offline_chat_response,
)


def test_build_system_context(sample_resume_text: str, sample_jd_text: str):
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "score_data": {
            "overall_score": 82.5,
            "tier_label": "Outstanding Match",
            "sub_scores": {"skill_score": 80, "semantic_score": 85, "keyword_score": 75},
        },
        "skill_comp": {
            "matched_skills": ["Python", "FastAPI", "Docker", "AWS"],
            "missing_skills": ["Kubernetes"],
            "bonus_skills": ["Go", "Redis"],
        },
        "ats_audit": {
            "ats_score": 90.0,
            "status": "Excellent",
            "action_verbs_found": ["Architected", "Spearheaded"],
            "weak_phrases_found": [],
            "metrics_found": ["$120,000", "42%"],
            "word_count": 350,
        },
    }

    context = build_system_context(sample_resume_text, sample_jd_text, mock_analysis)
    assert "Jane Doe" in context
    assert "82.5%" in context
    assert "Python, FastAPI" in context
    assert "Kubernetes" in context


def test_generate_offline_chat_response_missing_skills(sample_resume_text: str, sample_jd_text: str):
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "score_data": {"overall_score": 70.0},
        "skill_comp": {
            "matched_skills": ["Python", "FastAPI"],
            "missing_skills": ["Kubernetes", "AWS"],
        },
        "ats_audit": {"status": "Good", "ats_score": 80},
    }

    resp = generate_offline_chat_response(
        user_query="What skills am I missing and how do I fix them?",
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
    )
    assert "Missing Skills" in resp
    assert "Kubernetes" in resp


def test_generate_offline_chat_response_star_rewrite(sample_resume_text: str, sample_jd_text: str):
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "score_data": {"overall_score": 75.0},
        "skill_comp": {"matched_skills": ["Python"], "missing_skills": ["Docker"]},
        "ats_audit": {"status": "Good"},
    }

    resp = generate_offline_chat_response(
        user_query="How do I rewrite my experience with STAR method?",
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
    )
    assert "STAR" in resp
    assert "Before" in resp
    assert "After" in resp


def test_chat_with_copilot_fallback_to_offline(sample_resume_text: str, sample_jd_text: str):
    messages = [{"role": "user", "content": "Explain my match score"}]
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "score_data": {
            "overall_score": 80.0,
            "sub_scores": {"skill_score": 80, "semantic_score": 80, "keyword_score": 80},
        },
        "skill_comp": {"matched_skills": ["Python"], "missing_skills": []},
        "ats_audit": {"status": "Good", "ats_score": 85},
    }

    # Calling without an API key invokes the offline context engine
    reply = chat_with_copilot(
        messages=messages,
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
        api_key=None,
    )
    assert "Score Breakdown Rationale" in reply
    assert "80.0%" in reply
