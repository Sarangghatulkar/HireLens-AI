"""Interactive AI Career Copilot and Chat System for HireLens AI.

Enables candidates to converse in real-time with an AI assistant that has full context
of their uploaded resume, target job description, matched/missing skills, and ATS audit.
Works with Google Gemini API when available, and provides an intelligent context-aware
fallback engine when running offline without an API key.
"""

import os
import re
from typing import Any, Dict, List, Optional


def build_system_context(
    resume_text: str,
    jd_text: str,
    analysis_results: Optional[Dict[str, Any]] = None,
) -> str:
    """Builds a comprehensive technical summary of the candidate's analysis for the AI chat."""
    if not analysis_results:
        return f"""
TARGET JOB DESCRIPTION:
{jd_text[:1200]}

CANDIDATE RESUME:
{resume_text[:1500]}
"""

    score_data = analysis_results.get("score_data", {})
    skill_comp = analysis_results.get("skill_comparison", analysis_results.get("skill_comp", {}))
    ats_audit = analysis_results.get("ats_audit", {})
    candidate_name = analysis_results.get("candidate_name", "Candidate")

    matched_skills = ", ".join(skill_comp.get("matched_skills", [])) or "None"
    missing_skills = ", ".join(skill_comp.get("missing_skills", [])) or "None"
    bonus_skills = ", ".join(skill_comp.get("bonus_skills", [])[:10]) or "None"
    action_verbs = ", ".join(ats_audit.get("action_verbs_found", [])[:8]) or "None"
    weak_phrases = ", ".join(ats_audit.get("weak_phrases_found", [])) or "None"
    metrics = ", ".join(ats_audit.get("metrics_found", [])[:6]) or "None"

    return f"""
CANDIDATE NAME: {candidate_name}
OVERALL MATCH SCORE: {score_data.get('overall_score', 0)}% ({score_data.get('tier_label', 'Evaluation')})
SKILLS OVERLAP SCORE: {score_data.get('sub_scores', {}).get('skill_score', 0)}%
SEMANTIC VECTOR SCORE: {score_data.get('sub_scores', {}).get('semantic_score', 0)}%
KEYWORD SCORE: {score_data.get('sub_scores', {}).get('keyword_score', 0)}%
ATS COMPLIANCE SCORE: {ats_audit.get('ats_score', 0)}% ({ats_audit.get('status', 'Good')})

MATCHED SKILLS: {matched_skills}
MISSING SKILL GAPS: {missing_skills}
BONUS CANDIDATE SKILLS: {bonus_skills}
DETECTED POWER VERBS: {action_verbs}
DETECTED WEAK PASSIVE PHRASES: {weak_phrases}
QUANTIFIED METRICS DETECTED: {metrics}
WORD COUNT: {ats_audit.get('word_count', 0)} words

TARGET JOB DESCRIPTION EXCERPT:
{jd_text[:1200]}

CANDIDATE RESUME EXCERPT:
{resume_text[:1500]}
"""


def generate_offline_chat_response(
    user_query: str,
    resume_text: str,
    jd_text: str,
    analysis_results: Optional[Dict[str, Any]],
) -> str:
    """Provides an intelligent, context-aware conversational response without an external API.

    Tailors advice directly to the user's specific resume and target job requirements.
    """
    query = user_query.lower()

    if not analysis_results:
        return (
            "Please click **'⚡ Analyze Resume & Match Job'** above first! "
            "Once I finish analyzing your resume against the job description, "
            "I will be able to answer specific questions about your score, skill gaps, bullet rewrites, and interview preparation."
        )

    score_data = analysis_results.get("score_data", {})
    skill_comp = analysis_results.get("skill_comparison", analysis_results.get("skill_comp", {}))
    ats_audit = analysis_results.get("ats_audit", {})
    matched = skill_comp.get("matched_skills", [])
    missing = skill_comp.get("missing_skills", [])
    weak_phrases = ats_audit.get("weak_phrases_found", [])
    metrics = ats_audit.get("metrics_found", [])

    # Intent 1: Missing skills & how to fix
    if any(k in query for k in ["missing", "skill", "gap", "technolog", "what skills"]):
        if missing:
            top_missing = missing[:5]
            return (
                f"### 🎯 Missing Skills Breakdown\n\n"
                f"Your resume is currently missing **{len(missing)} key skills** specified in the job description:\n\n"
                + "\n".join([f"- **{s}**" for s in top_missing])
                + f"\n\n**💡 Recommended Action Plan:**\n"
                f"1. **Technical Skills Section:** Add `{', '.join(top_missing[:3])}` directly into your Technical Skills matrix.\n"
                f"2. **Project Experience:** Pick 1-2 projects where you used related tools, and explicitly describe your usage of these technologies.\n"
                f"3. **Certifications / Courses:** If you are learning any of these, list them under 'Continuous Learning' or 'Certifications in Progress'."
            )
        else:
            return (
                "🎉 **Great news!** You matched all explicit required skills detected in this job description. "
                f"Your core matched stack includes: **{', '.join(matched[:8])}**.\n\n"
                "To gain an even stronger edge, focus on quantifying your impact with percentages and dollar amounts in your work experience!"
            )

    # Intent 2: Rewriting bullets or STAR method
    if any(k in query for k in ["rewrite", "bullet", "star", "experience", "improve bullet", "duty"]):
        sample_missing = missing[0] if missing else "the primary requirement"
        return (
            "### ✍️ High-Impact STAR Bullet Rewriting Framework\n\n"
            "To impress hiring managers, transform passive task descriptions into quantified achievements using the **STAR Formula**:  \n"
            "*(Action Verb) + (Technical Task / Scope) + (Quantified Result)*\n\n"
            "**Example Transformation:**\n"
            "- ❌ **Before (Weak):** *Responsible for building backend services and working with the database.*\n"
            "- ✅ **After (High Impact):** *Architected 12+ RESTful microservices using Python and PostgreSQL, reducing API response latency by 38% for 450k daily active users.*\n\n"
            f"**Tailored Tip for This Role:**\n"
            f"Incorporate `{sample_missing}` into your most recent role by demonstrating how you solved a business problem with it!"
        )

    # Intent 3: Score explanation & why
    if any(k in query for k in ["score", "why", "percentage", "calculate", "low", "high"]):
        overall = score_data.get("overall_score", 0)
        sub = score_data.get("sub_scores", {})
        return (
            f"### 📊 Score Breakdown Rationale (Current: {overall}%)\n\n"
            f"HireLens AI uses an explainable 4-pillar composite evaluation:\n\n"
            f"1. **Skills Match ({sub.get('skill_score', 0)}% - 40% Weight):** You matched {skill_comp.get('matched_count', 0)} of {skill_comp.get('total_required', 0)} target skills.\n"
            f"2. **Semantic Vector Depth ({sub.get('semantic_score', 0)}% - 30% Weight):** Measures contextual alignment of your experience with the job description using Sentence Transformers.\n"
            f"3. **TF-IDF Keyword Match ({sub.get('keyword_score', 0)}% - 15% Weight):** Lexical frequency of domain terms.\n"
            f"4. **ATS Compliance ({ats_audit.get('ats_score', 0)}% - 15% Weight):** Structure, power verbs, and measurable impact.\n\n"
            f"**Fastest way to increase your score:** Integrate `{', '.join(missing[:3])}` and convert passive verbs into quantified metrics!"
        )

    # Intent 4: ATS Health & Formatting
    if any(k in query for k in ["ats", "format", "readab", "reject", "filter"]):
        status = ats_audit.get("status", "Good")
        score = ats_audit.get("ats_score", 0)
        advice = []
        if weak_phrases:
            advice.append(f"Remove passive phrasing like *'{', '.join(weak_phrases)}'* and replace with power action verbs.")
        if len(metrics) < 3:
            advice.append("Add at least 3-4 quantified metrics (percentages, team sizes, dollar savings).")
        if ats_audit.get("word_count", 0) < 350:
            advice.append("Expand your resume text to at least 400 words to provide adequate keyword density.")

        return (
            f"### 📋 ATS Readiness Report (Score: {score}% - {status})\n\n"
            f"Applicant Tracking Systems parse standard headers and search for relevant keywords.\n\n"
            + ("**Key Areas to Fix:**\n" + "\n".join([f"- {a}" for a in advice]) if advice else "Your formatting and sections are ATS-friendly!")
        )

    # Intent 5: Interview Questions Prep
    if any(k in query for k in ["interview", "question", "prep", "ask me", "screening"]):
        top_skills = matched[:3] if matched else ["System Design", "Problem Solving"]
        gap_skill = missing[0] if missing else "scalability tradeoffs"
        return (
            f"### 🎤 3 High-Probability Technical Interview Questions for This Role\n\n"
            f"1. **Core Strength Question ({top_skills[0]}):**  \n"
            f"   *\"Walk me through an architecture where you utilized {top_skills[0]}. What were the toughest bottlenecks you solved, and how did you verify performance?\"*\n\n"
            f"2. **Target Domain Question ({top_skills[1] if len(top_skills) > 1 else 'Architecture'}):**  \n"
            f"   *\"How do you ensure reliability, error handling, and observability in production deployments?\"*\n\n"
            f"3. **Addressing the Skill Gap ({gap_skill}):**  \n"
            f"   *\"This role heavily involves {gap_skill}. How have you approached learning or working with unfamiliar technologies under tight project deadlines?\"*"
        )

    # Default general guidance
    return (
        f"### 💡 HireLens Copilot Recommendations for {analysis_results.get('candidate_name', 'Your Profile')}\n\n"
        f"Based on your **{score_data.get('overall_score', 0)}% match score** against this job description:\n\n"
        f"- **Top Matched Strengths:** {', '.join(matched[:5]) or 'Identified in analysis'}\n"
        f"- **Primary Gaps to Address:** {', '.join(missing[:4]) or 'None identified'}\n\n"
        "You can ask me specific questions like:\n"
        "- *'How can I rewrite my experience bullets to include missing skills?'*\n"
        "- *'What technical interview questions will they ask for this position?'*\n"
        "- *'Why is my ATS health score at this level?'*\n"
        "- *'Write an elevator pitch summary tailored to this company.'*"
    )


def chat_with_copilot(
    messages: List[Dict[str, str]],
    resume_text: str,
    jd_text: str,
    analysis_results: Optional[Dict[str, Any]],
    api_key: Optional[str] = None,
) -> str:
    """Dispatches user query to Gemini API if configured, or uses the context-aware offline NLP engine."""
    user_query = messages[-1]["content"] if messages else ""
    key = api_key or os.getenv("GEMINI_API_KEY", "").strip()

    # Try Gemini LLM first if key is provided
    if key:
        try:
            from google import genai

            client = genai.Client(api_key=key)
            system_prompt = (
                "You are 'HireLens AI Copilot', an elite technical recruiter and executive career coach. "
                "You have full context of the candidate's resume, the target job description, their match score, "
                "matched skills, missing skills, and ATS compliance audit. "
                "Give sharp, actionable, encouraging, and highly specific career and resume advice. "
                "Quote actual skills and bullet points from their resume when relevant. "
                "Keep responses well-structured with markdown headings, bullet points, and code/text examples where helpful."
            )
            context = build_system_context(resume_text, jd_text, analysis_results)
            full_prompt = f"{system_prompt}\n\nCONTEXT:\n{context}\n\nUSER QUESTION:\n{user_query}"

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
            )
            if response and response.text:
                return response.text.strip()
        except Exception:
            # Fall back gracefully to built-in NLP engine
            offline_resp = generate_offline_chat_response(
                user_query=user_query,
                resume_text=resume_text,
                jd_text=jd_text,
                analysis_results=analysis_results,
            )
            return f"*(Note: Running with HireLens Local NLP Engine)*\n\n{offline_resp}"

    # Use built-in context-aware engine
    return generate_offline_chat_response(
        user_query=user_query,
        resume_text=resume_text,
        jd_text=jd_text,
        analysis_results=analysis_results,
    )
