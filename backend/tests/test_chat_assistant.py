"""Unit tests for AI Career Copilot dynamic responses, context generation, and offline engine."""

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
    assert "Original Bullet" in resp or "Before" in resp
    assert "Rewrite" in resp or "After" in resp


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

    # Calling without an API key invokes the offline dynamic engine
    reply, source, model = chat_with_copilot(
        messages=messages,
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
        api_key=None,
    )
    assert "Score Breakdown Rationale" in reply
    assert "80.0%" in reply
    assert source == "offline_nlp_engine"
    assert model is None


def test_cover_letter_generation(sample_resume_text: str, sample_jd_text: str):
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "job_title": "Senior Python Backend Engineer",
        "score_data": {"overall_score": 85.0},
        "skill_comp": {"matched_skills": ["Python", "FastAPI", "Docker"], "missing_skills": []},
    }

    resp = generate_offline_chat_response(
        user_query="Can you write a cover letter for this role?",
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
    )
    assert "Cover Letter" in resp
    assert "Jane Doe" in resp
    assert "Python" in resp


def test_technology_deep_dive(sample_resume_text: str, sample_jd_text: str):
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "skill_comp": {"matched_skills": ["Python"], "missing_skills": ["Kubernetes"]},
    }

    resp = generate_offline_chat_response(
        user_query="What is Kubernetes and why is it needed?",
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
    )
    assert "Kubernetes" in resp
    assert "Strategy" in resp or "Pillar" in resp or "Role" in resp


def test_salary_negotiation_advice(sample_resume_text: str, sample_jd_text: str):
    mock_analysis = {
        "candidate_name": "Jane Doe",
        "score_data": {"overall_score": 85.0},
        "skill_comp": {"matched_skills": ["Python", "FastAPI"], "missing_skills": []},
    }

    resp = generate_offline_chat_response(
        user_query="What salary and compensation strategy should I use?",
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=mock_analysis,
    )
    assert "Salary" in resp or "Compensation" in resp
    assert "Negotiation" in resp or "Script" in resp


def test_reverse_interview_questions(sample_resume_text: str, sample_jd_text: str):
    resp = generate_offline_chat_response(
        user_query="What questions should I ask the interviewer?",
        resume_text=sample_resume_text,
        jd_text=sample_jd_text,
        analysis_results=None,
    )
    assert "Questions to Ask" in resp
