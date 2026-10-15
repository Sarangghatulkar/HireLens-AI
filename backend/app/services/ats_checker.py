"""ATS (Applicant Tracking System) compliance checker, formatting auditor, and readability evaluator."""

import math
import re
from typing import Any, Dict, List, Tuple
from app.services.parser import detect_resume_sections, extract_contact_info

POWER_ACTION_VERBS = [
    "accelerated", "accomplished", "achieved", "administered", "advanced",
    "amplified", "analyzed", "architected", "automated", "built",
    "centralized", "championed", "collaborated", "constructed", "coordinated",
    "created", "cultivated", "customized", "decreased", "delivered",
    "deployed", "designed", "developed", "devised", "diagnosed",
    "directed", "discovered", "doubled", "drove", "engineered",
    "enhanced", "established", "executed", "expanded", "expedited",
    "fabricated", "facilitated", "formulated", "founded", "generated",
    "guided", "headed", "identified", "implemented", "improved",
    "increased", "initiated", "innovated", "inspected", "installed",
    "instituted", "integrated", "introduced", "invented", "launched",
    "led", "managed", "maximized", "mentored", "migrated",
    "minimized", "modernized", "negotiated", "optimized", "orchestrated",
    "overhauled", "oversaw", "partnered", "pioneered", "planned",
    "produced", "programmed", "promoted", "published", "reduced",
    "refactored", "resolved", "restructured", "revamped", "saved",
    "scaled", "simplified", "spearheaded", "standardized", "streamlined",
    "strengthened", "structured", "surpassed", "trained", "transformed",
    "unified", "upgraded", "validated", "yielded"
]

WEAK_PASSIVE_PHRASES = [
    "responsible for", "was responsible for", "worked on", "helped with",
    "assisted with", "assisted in", "duties included", "tasked with",
    "part of a team that", "participated in", "handled", "dealt with"
]


def audit_ats_compliance(resume_text: str) -> Dict[str, Any]:
    """Performs an extensive ATS compatibility audit on resume text.

    Returns:
        Dict containing section checks, action verbs, quantified metrics,
        readability score, overall ATS score (0-100), and actionable checklist.
    """
    if not resume_text:
        return {
            "ats_score": 0,
            "sections_check": {},
            "contact_check": {},
            "metrics_count": 0,
            "metrics_found": [],
            "action_verbs_found": [],
            "weak_phrases_found": [],
            "word_count": 0,
            "bullet_count": 0,
            "readability_score": 0.0,
            "readability_level": "N/A",
            "checklist": [],
            "status": "Incomplete",
        }

    # 1. Sections presence
    sections = detect_resume_sections(resume_text)

    # 2. Contact details detection
    contact = extract_contact_info(resume_text)
    has_email = bool(contact.get("email"))
    has_phone = bool(contact.get("phone"))
    has_link = bool(contact.get("linkedin") or contact.get("github"))

    # 3. Action verbs detection
    lowered = resume_text.lower()
    action_verbs_found = [verb for verb in POWER_ACTION_VERBS if re.search(rf"\b{verb}\b", lowered)]
    weak_phrases_found = [phrase for phrase in WEAK_PASSIVE_PHRASES if phrase in lowered]

    # 4. Quantified metrics detection
    metrics_patterns = [
        r"\b\d+%",                                    # Percentages: 45%
        r"\$\s*\d+(?:[.,]\d+)?\s*[kKmMbB]?",          # Dollars: $100k, $1.5M
        r"\b\d+(?:[.,]\d+)?\s*[kKmMbB]\b",           # Large numbers: 500k, 2M
        r"\b(?:reduced|increased|improved|saved)\s+by\s+\d+", # relative changes
        r"\b\d+x\b",                                  # Multipliers: 10x
    ]
    metrics_found = []
    for pat in metrics_patterns:
        matches = re.findall(pat, resume_text, flags=re.I)
        metrics_found.extend(matches)
    metrics_found = list(set(metrics_found))

    # 5. Readability & length audit
    words = resume_text.split()
    word_count = len(words)
    bullets = re.findall(r"(?:^|\n)\s*[-•*]\s+", resume_text)
    bullet_count = len(bullets)

    readability_score, readability_level = compute_flesch_reading_ease(resume_text)

    # 6. Build ATS compliance checklist
    checklist = []

    # Section Headers (30 points total)
    has_exp = sections.get("Experience", False)
    has_edu = sections.get("Education", False)
    has_skills = sections.get("Skills", False)
    has_summary = sections.get("Summary / Objective", False)
    has_projects = sections.get("Projects", False)

    checklist.append({
        "item": "Work Experience Section",
        "passed": has_exp,
        "detail": "Standard 'Experience' header found" if has_exp else "Missing explicit Experience header",
        "weight": 10,
    })
    checklist.append({
        "item": "Education Section",
        "passed": has_edu,
        "detail": "Degree/University section detected" if has_edu else "Missing Education header",
        "weight": 5,
    })
    checklist.append({
        "item": "Skills Section",
        "passed": has_skills,
        "detail": "Delineated Technical Skills section detected" if has_skills else "Missing Skills header",
        "weight": 10,
    })
    checklist.append({
        "item": "Summary / Objective Section",
        "passed": has_summary,
        "detail": "Executive summary found" if has_summary else "Recommended to add a short professional summary",
        "weight": 5,
    })

    # Contact Info (20 points total)
    checklist.append({
        "item": "Email Address",
        "passed": has_email,
        "detail": f"Detected: {contact.get('email')}" if has_email else "No valid email found in header",
        "weight": 10,
    })
    checklist.append({
        "item": "Phone Number",
        "passed": has_phone,
        "detail": f"Detected: {contact.get('phone')}" if has_phone else "No telephone contact detected",
        "weight": 5,
    })
    checklist.append({
        "item": "Professional Profiles (LinkedIn/GitHub)",
        "passed": has_link,
        "detail": "Portfolio/Profile link found" if has_link else "Add LinkedIn or GitHub for recruiter credibility",
        "weight": 5,
    })

    # Action Verbs (20 points)
    verbs_passed = len(action_verbs_found) >= 5
    checklist.append({
        "item": "Power Action Verbs Density",
        "passed": verbs_passed,
        "detail": f"Detected {len(action_verbs_found)} high-impact verbs (Recommended: 5+)" if verbs_passed else f"Only {len(action_verbs_found)} action verbs found. Use verbs like 'Architected', 'Spearheaded'",
        "weight": 20,
    })

    # Quantified Metrics (15 points)
    metrics_passed = len(metrics_found) >= 3
    checklist.append({
        "item": "Quantifiable Achievements & KPIs",
        "passed": metrics_passed,
        "detail": f"Detected {len(metrics_found)} quantifiable metrics (e.g. %, $ savings)" if metrics_passed else f"Only {len(metrics_found)} metrics found. Quantify your achievements (e.g., 'improved by 35%')",
        "weight": 15,
    })

    # Resume Length (15 points)
    length_passed = 300 <= word_count <= 1100
    checklist.append({
        "item": "Optimal Resume Length",
        "passed": length_passed,
        "detail": f"{word_count} words (Optimal: 350-900 words)" if length_passed else f"{word_count} words (Length out of optimal 350-900 word single/double page density)",
        "weight": 15,
    })

    # Calculate overall ATS Score
    total_weight = sum(item["weight"] for item in checklist)
    earned_weight = sum(item["weight"] for item in checklist if item["passed"])

    # Penalty for excessive weak passive phrases
    penalty = min(len(weak_phrases_found) * 3, 15)
    final_score = max(0.0, min(100.0, ((earned_weight / total_weight) * 100.0) - penalty))
    final_score = round(final_score, 1)

    if final_score >= 85:
        status = "Excellent"
    elif final_score >= 70:
        status = "Good"
    elif final_score >= 50:
        status = "Needs Improvement"
    else:
        status = "Critical Fixes Needed"

    return {
        "ats_score": final_score,
        "sections_check": sections,
        "contact_check": {
            "has_email": has_email,
            "has_phone": has_phone,
            "has_link": has_link,
            "email": contact.get("email"),
            "phone": contact.get("phone"),
            "linkedin": contact.get("linkedin"),
            "github": contact.get("github"),
        },
        "metrics_count": len(metrics_found),
        "metrics_found": metrics_found,
        "action_verbs_count": len(action_verbs_found),
        "action_verbs_found": action_verbs_found,
        "weak_phrases_count": len(weak_phrases_found),
        "weak_phrases_found": weak_phrases_found,
        "word_count": word_count,
        "bullet_count": bullet_count,
        "readability_score": readability_score,
        "readability_level": readability_level,
        "checklist": checklist,
        "status": status,
    }


def compute_flesch_reading_ease(text: str) -> Tuple[float, str]:
    """Calculates standard Flesch Reading Ease score for resume text."""
    if not text:
        return 0.0, "N/A"

    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 3]
    total_sentences = max(len(sentences), 1)

    words = re.findall(r"\b[a-zA-Z]+\b", text)
    total_words = max(len(words), 1)

    # Estimate syllables per word
    def count_syllables(w: str) -> int:
        w = w.lower()
        count = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and not w.endswith("le") and count > 1:
            count -= 1
        return max(count, 1)

    total_syllables = sum(count_syllables(w) for w in words)

    score = 206.835 - (1.015 * (total_words / total_sentences)) - (84.6 * (total_syllables / total_words))
    score = round(max(0.0, min(100.0, score)), 1)

    if score >= 60:
        level = "Plain English (High Recruiter Readability)"
    elif score >= 45:
        level = "Professional / Technical (Standard)"
    else:
        level = "Dense / Complex Academic"

    return score, level
