from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import get_optional_current_user
from app.core.security import resolve_api_key, sanitize_text
from app.db.session import get_db
from app.models.scan import ResumeScan
from app.models.user import User
from app.schemas.analyze import AnalyzeRequest
from app.services.ats_checker import audit_ats_compliance
from app.services.parser import extract_contact_info
from app.services.recommender import (
    generate_gemini_enhanced_recommendations,
    generate_rule_based_recommendations,
)
from app.services.scorer import calculate_match_score
from app.services.skill_extractor import compare_skills, extract_keywords, extract_skills

router = APIRouter(tags=["Analysis"])


@router.post("/analyze")
def analyze_resume(
    req: AnalyzeRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Executes multi-layered resume matching, skills extraction, ATS audit, and recommendations."""
    resume_text = sanitize_text(req.resume_text)
    jd_text = sanitize_text(req.jd_text)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text is required")
    if not jd_text:
        raise HTTPException(status_code=400, detail="Job description text is required")

    # 1. Contact & candidate name
    contact_info = extract_contact_info(resume_text)
    candidate_name = contact_info.get("name", "Candidate")

    # 2. Extract Skills
    resume_skills_dict = extract_skills(resume_text)
    jd_skills_dict = extract_skills(jd_text)

    # 3. Compare Skills
    skill_comp = compare_skills(
        resume_skills=resume_skills_dict["skills"],
        jd_skills=jd_skills_dict["skills"],
    )

    # 4. Extract Keywords
    jd_keywords = extract_keywords(jd_text, top_n=15)
    resume_keywords = extract_keywords(resume_text, top_n=15)

    # 5. Audit ATS Compliance
    ats_audit = audit_ats_compliance(resume_text)

    # 6. Composite Match Score
    score_data = calculate_match_score(
        resume_text=resume_text,
        jd_text=jd_text,
        skill_comparison=skill_comp,
        ats_audit=ats_audit,
    )

    # 7. Actionable Recommendations
    rule_recs = generate_rule_based_recommendations(
        skill_comparison=skill_comp,
        ats_audit=ats_audit,
        resume_text=resume_text,
        jd_text=jd_text,
    )

    # 8. Optional Gemini Generative Enhancements
    gemini_recs = None
    api_key = resolve_api_key(req.api_key)
    if api_key:
        gemini_recs = generate_gemini_enhanced_recommendations(
            resume_text=resume_text,
            jd_text=jd_text,
            missing_skills=skill_comp["missing_skills"],
            api_key=api_key,
        )

    result_payload = {
        "candidate_name": candidate_name,
        "contact_info": contact_info,
        "job_title": req.job_title or "Target Role",
        "resume_skills": resume_skills_dict["skills"],
        "jd_skills": jd_skills_dict["skills"],
        "skill_comparison": skill_comp,
        "jd_keywords": jd_keywords,
        "resume_keywords": resume_keywords,
        "ats_audit": ats_audit,
        "score_data": score_data,
        "rule_recs": rule_recs,
        "gemini_recs": gemini_recs,
    }

    # Persist evaluation to database if user is authenticated or session is active
    saved_scan_id = None
    try:
        scan_record = ResumeScan(
            user_id=current_user.id if current_user else None,
            candidate_name=candidate_name,
            job_title=req.job_title or "Target Role",
            overall_score=score_data.get("overall_score", 0.0),
            tier_label=score_data.get("tier_label", "Evaluation"),
            skill_score=score_data.get("sub_scores", {}).get("skill_score", 0.0),
            semantic_score=score_data.get("sub_scores", {}).get("semantic_score", 0.0),
            keyword_score=score_data.get("sub_scores", {}).get("keyword_score", 0.0),
            ats_score=ats_audit.get("ats_score", 0.0),
            matched_skills=skill_comp.get("matched_skills", []),
            missing_skills=skill_comp.get("missing_skills", []),
            bonus_skills=skill_comp.get("bonus_skills", []),
            resume_snippet=resume_text[:400],
            jd_snippet=jd_text[:400],
            full_results_json=result_payload,
        )
        db.add(scan_record)
        db.commit()
        db.refresh(scan_record)
        saved_scan_id = scan_record.id
    except Exception:
        # Never break core analysis if database write encounters any issue
        db.rollback()

    result_payload["scan_id"] = saved_scan_id
    return result_payload
