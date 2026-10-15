"""Scoring engine combining Semantic Embeddings, TF-IDF lexical similarity, and Skill matching."""

import os
import warnings
from typing import Any, Dict, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Suppress HuggingFace symlinks warning on Windows
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
warnings.filterwarnings("ignore", category=UserWarning, module="huggingface_hub")

_TRANSFORMER_MODEL = None
_MODEL_FAILED = False


def get_embedding_model():
    """Lazy loader for SentenceTransformer model with local cache priority and fallback."""
    global _TRANSFORMER_MODEL, _MODEL_FAILED
    if _MODEL_FAILED:
        return None

    if _TRANSFORMER_MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            try:
                # Prioritize local cached files for instant offline startup
                _TRANSFORMER_MODEL = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
            except Exception:
                _TRANSFORMER_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _MODEL_FAILED = True
            return None
    return _TRANSFORMER_MODEL


def compute_semantic_similarity(resume_text: str, jd_text: str) -> float:
    """Computes semantic similarity score (0.0 to 100.0) using Sentence Transformers.

    Falls back to dense TF-IDF similarity if transformer model is unavailable.
    """
    if not resume_text or not jd_text:
        return 0.0

    model = get_embedding_model()
    if model is not None:
        try:
            # Chunking or truncating to avoid model context overflow
            res_snippet = resume_text[:3500]
            jd_snippet = jd_text[:3500]

            embeddings = model.encode([res_snippet, jd_snippet], convert_to_numpy=True)
            emb_res = embeddings[0].reshape(1, -1)
            emb_jd = embeddings[1].reshape(1, -1)
            sim = float(cosine_similarity(emb_res, emb_jd)[0][0])
            
            # Calibrate cosine similarity for SentenceTransformers:
            # Baseline unrelated text: <0.15 -> maps to <20%
            # Moderate contextual overlap: 0.35-0.55 -> maps to 50%-75%
            # High semantic alignment: >0.70 -> maps to >88%
            if sim <= 0.12:
                scaled_sim = max(0.0, sim * 1.2)
            else:
                scaled_sim = 0.15 + ((sim - 0.12) / (0.75 - 0.12)) * 0.85
            return round(max(0.0, min(100.0, scaled_sim * 100)), 1)
        except Exception:
            pass

    # Fallback to TF-IDF cosine similarity
    return compute_tfidf_similarity(resume_text, jd_text)


def compute_tfidf_similarity(resume_text: str, jd_text: str) -> float:
    """Computes lexical cosine similarity (0.0 to 100.0) using TF-IDF."""
    if not resume_text or not jd_text:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=250,
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z0-9+#.-]{1,}\b",
        )
        tfidf = vectorizer.fit_transform([resume_text, jd_text])
        sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
        return round(sim * 100.0, 1)
    except Exception:
        return 0.0


def calculate_match_score(
    resume_text: str,
    jd_text: str,
    skill_comparison: Dict[str, Any],
    ats_audit: Dict[str, Any],
) -> Dict[str, Any]:
    """Calculates explainable composite match score combining 4 pillars:

    1. Skills Overlap (40% Weight): Match ratio against required JD skills.
    2. Semantic Context (30% Weight): Deep vector similarity from Sentence Transformers.
    3. Keyword Frequency (15% Weight): Lexical TF-IDF n-gram alignment.
    4. ATS & Structure (15% Weight): Section health, power verbs, and quantified metrics.
    """
    # 1. Skill Match Component (40%)
    skill_score = float(skill_comparison.get("match_percentage", 0.0))

    # 2. Semantic Embedding Component (30%)
    semantic_score = compute_semantic_similarity(resume_text, jd_text)

    # 3. TF-IDF Lexical Component (15%)
    keyword_score = compute_tfidf_similarity(resume_text, jd_text)

    # 4. ATS Compliance Component (15%)
    ats_score = float(ats_audit.get("ats_score", 0.0))

    # Weighted calculation
    overall = (
        (skill_score * 0.40)
        + (semantic_score * 0.30)
        + (keyword_score * 0.15)
        + (ats_score * 0.15)
    )
    overall = round(max(0.0, min(100.0, overall)), 1)

    # Determine qualitative Tier & Status
    if overall >= 85:
        tier_label = "Outstanding Match"
        tier_color = "#10B981"  # Emerald
        tier_desc = "Top 5% alignment. Strong interview candidate for this role."
    elif overall >= 72:
        tier_label = "Strong Match"
        tier_color = "#3B82F6"  # Blue
        tier_desc = "Solid qualification match. Recommended to tailor top bullet points."
    elif overall >= 55:
        tier_label = "Moderate Match"
        tier_color = "#F59E0B"  # Amber
        tier_desc = "Partial alignment. Address critical missing skills and ATS formatting."
    else:
        tier_label = "Low Alignment"
        tier_color = "#EF4444"  # Red
        tier_desc = "Significant gaps in required skills or role domain experience."

    return {
        "overall_score": overall,
        "tier_label": tier_label,
        "tier_color": tier_color,
        "tier_desc": tier_desc,
        "sub_scores": {
            "skill_score": skill_score,
            "semantic_score": semantic_score,
            "keyword_score": keyword_score,
            "ats_score": ats_score,
        },
        "weights": {
            "skill_weight": 40,
            "semantic_weight": 30,
            "keyword_weight": 15,
            "ats_weight": 15,
        },
        "contribution_breakdown": [
            {
                "pillar": "Skills Match",
                "weight": "40%",
                "raw_score": skill_score,
                "earned_points": round(skill_score * 0.40, 1),
                "desc": f"Matched {skill_comparison.get('matched_count', 0)} of {skill_comparison.get('total_required', 0)} target skills",
            },
            {
                "pillar": "Semantic Similarity",
                "weight": "30%",
                "raw_score": semantic_score,
                "earned_points": round(semantic_score * 0.30, 1),
                "desc": "Contextual sentence vector alignment (all-MiniLM-L6-v2)",
            },
            {
                "pillar": "Keyword Overlap",
                "weight": "15%",
                "raw_score": keyword_score,
                "earned_points": round(keyword_score * 0.15, 1),
                "desc": "Lexical domain frequency and n-gram alignment",
            },
            {
                "pillar": "ATS Readiness",
                "weight": "15%",
                "raw_score": ats_score,
                "earned_points": round(ats_score * 0.15, 1),
                "desc": "Standard sections, power verbs, and quantified achievements",
            },
        ],
    }
