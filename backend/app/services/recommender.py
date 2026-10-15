"""AI-powered resume improvement engine: Built-in Rule-based NLP + Optional Gemini API."""

import os
from typing import Any, Dict, List, Optional


def generate_rule_based_recommendations(
    skill_comparison: Dict[str, Any],
    ats_audit: Dict[str, Any],
    resume_text: str,
    jd_text: str,
) -> Dict[str, Any]:
    """Generates detailed, actionable resume enhancement recommendations.

    Categorized into:
    - Critical Fixes (Pass ATS filters)
    - High-Impact Skill Gaps (Improve role match)
    - Polish & STAR Method Improvements (Stand out to hiring managers)
    """
    critical_fixes: List[Dict[str, str]] = []
    skill_enhancements: List[Dict[str, str]] = []
    polish_tips: List[Dict[str, str]] = []

    # 1. Check Missing Sections
    sections = ats_audit.get("sections_check", {})
    if not sections.get("Summary / Objective"):
        critical_fixes.append({
            "title": "Add a Tailored Professional Summary",
            "desc": "Include a 2-3 sentence executive summary at the top highlighting your core tech stack, years of experience, and alignment with the target role.",
            "impact": "+5% ATS & Recruiter engagement",
        })
    if not sections.get("Projects") and not sections.get("Experience"):
        critical_fixes.append({
            "title": "Missing Experience / Projects Section",
            "desc": "Standard ATS parsers search for explicit 'Professional Experience' or 'Projects' headers. Ensure these headers are clearly delineated.",
            "impact": "Crucial for ATS parsing",
        })

    # 2. Check Contact Details
    contact = ats_audit.get("contact_check", {})
    if not contact.get("has_email"):
        critical_fixes.append({
            "title": "Missing or Unrecognized Email Address",
            "desc": "Add a standard email address in the resume header so recruiters and ATS can contact you.",
            "impact": "Mandatory for recruiter callbacks",
        })
    if not contact.get("has_link"):
        critical_fixes.append({
            "title": "Add Professional Profile Links",
            "desc": "Include your GitHub, LinkedIn, or personal portfolio URL to provide verifiable proof of your work and technical projects.",
            "impact": "+10% Recruiter verification rate",
        })

    # 3. Missing Skills Breakdown
    missing_skills = skill_comparison.get("missing_skills", [])
    if missing_skills:
        top_missing = missing_skills[:6]
        skill_enhancements.append({
            "title": f"Integrate Missing Target Skills: {', '.join(top_missing)}",
            "desc": f"The job description specifically requests '{', '.join(top_missing)}'. Add these to your Skills matrix and mention how you've applied them in your project bullet points.",
            "impact": f"+{min(len(top_missing) * 4, 25)}% Role Match Score",
        })

    # 4. Weak Action Verbs vs Power Verbs
    weak_phrases = ats_audit.get("weak_phrases_found", [])
    if weak_phrases:
        skill_enhancements.append({
            "title": "Replace Passive Phrasing with Leadership Verbs",
            "desc": f"Found passive duty phrases: '{', '.join(weak_phrases[:3])}'. Replace them with powerful action verbs like 'Architected', 'Spearheaded', 'Optimized', or 'Orchestrated'.",
            "impact": "+10% ATS verb density",
        })

    # 5. Quantified Achievements
    metrics = ats_audit.get("metrics_found", [])
    if len(metrics) < 3:
        polish_tips.append({
            "title": "Quantify Your Impact with Metrics & KPIs",
            "desc": "Your resume currently contains fewer than 3 quantified results. Include metrics such as '% performance improvement', '$ cloud cost reduction', or 'scale of daily active users'.",
            "impact": "+15% Hiring manager interview conversion",
        })

    # 6. STAR Method Bullet Point Rewrite Tip
    polish_tips.append({
        "title": "Apply the STAR Method (Situation, Task, Action, Result)",
        "desc": "Structure your top 3 experience bullet points as: (Power Verb) + (Context/Tools used) + (Measurable Business Impact).",
        "impact": "Executive presentation grade",
    })

    return {
        "critical_fixes": critical_fixes,
        "skill_enhancements": skill_enhancements,
        "polish_tips": polish_tips,
        "total_recommendations": len(critical_fixes) + len(skill_enhancements) + len(polish_tips),
    }


def generate_gemini_enhanced_recommendations(
    resume_text: str,
    jd_text: str,
    missing_skills: List[str],
    api_key: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Uses Google Gemini API to generate deep generative resume rewrites and executive career coaching."""
    key = api_key or os.getenv("GEMINI_API_KEY", "")
    if not key:
        return None

    try:
        from google import genai

        client = genai.Client(api_key=key)
        prompt = f"""
You are an elite Silicon Valley executive tech recruiter and ATS resume specialist.
Analyze this resume against the target job description and provide structured, high-impact advice.

TARGET JOB DESCRIPTION:
{jd_text[:2000]}

CANDIDATE RESUME:
{resume_text[:2500]}

IDENTIFIED MISSING SKILLS:
{', '.join(missing_skills) if missing_skills else 'None'}

Please provide:
1. Executive Summary Rewrite: A compelling 3-sentence summary tailored directly to this job.
2. Two Bullet Point Transformations: Pick 2 actual bullets or responsibilities from the candidate's background and rewrite them using the STAR method with power verbs and realistic metrics.
3. Top 3 Interview Preparation Questions: Specific technical or behavioral questions this employer will likely ask based on their skill gaps.

Keep the response clear, structured, and formatted with markdown.
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        if response and response.text:
            return {
                "success": True,
                "model": "gemini-2.5-flash",
                "content": response.text.strip(),
            }
        return None
    except Exception as exc:
        return {
            "success": False,
            "error": f"Gemini API request failed: {str(exc)}",
            "content": None,
        }
