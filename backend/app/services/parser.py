"""Resume and Job Description text parser, PII protector, and section segmenter."""

import io
import re
from typing import Any, Dict, List, Optional, Union
import pypdf


def extract_text_from_pdf(pdf_source: Union[str, bytes, io.BytesIO]) -> Dict[str, Any]:
    """Extracts raw and normalized text from a PDF document in-memory.

    Args:
        pdf_source: File path, bytes, or BytesIO buffer containing PDF data.

    Returns:
        Dict containing extracted text, page count, word count, and status.
    """
    try:
        if isinstance(pdf_source, (bytes, bytearray)):
            stream = io.BytesIO(pdf_source)
        elif isinstance(pdf_source, io.BytesIO):
            stream = pdf_source
        else:
            stream = open(pdf_source, "rb")

        reader = pypdf.PdfReader(stream)
        pages_text: List[str] = []

        for page in reader.pages:
            page_content = page.extract_text() or ""
            pages_text.append(page_content)

        raw_text = "\n\n".join(pages_text)
        cleaned_text = clean_text(raw_text)

        words = cleaned_text.split()
        return {
            "success": True,
            "text": cleaned_text,
            "raw_text": raw_text,
            "page_count": len(reader.pages),
            "word_count": len(words),
            "char_count": len(cleaned_text),
            "error": None,
        }
    except Exception as exc:
        return {
            "success": False,
            "text": "",
            "raw_text": "",
            "page_count": 0,
            "word_count": 0,
            "char_count": 0,
            "error": f"Failed to parse PDF: {str(exc)}",
        }


def clean_text(text: str) -> str:
    """Normalizes whitespace, hyphens, and removes control characters."""
    if not text:
        return ""

    # Rejoin hyphenated words broken across line wraps (e.g. "engi-\nneer" -> "engineer")
    normalized = re.sub(r"(\b\w+)-\s*\n\s*(\w+\b)", r"\1\2", text)

    # Standardize bullet point symbols to standard dash
    normalized = re.sub(r"[\u2022\u2023\u25E6\u2043\u2219\u25CF\u25AA\u25BA*]", "-", normalized)

    # Convert non-breaking and unusual spaces
    normalized = normalized.replace("\u00a0", " ").replace("\u200b", "")

    # Collapse repeated vertical whitespace (more than 2 newlines to 2)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)

    # Normalize horizontal whitespace on each line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in normalized.split("\n")]
    return "\n".join(lines).strip()


def mask_pii(text: str) -> str:
    """Masks sensitive candidate PII (email, phone numbers) for privacy."""
    if not text:
        return ""

    # Mask email addresses
    masked = re.sub(
        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
        "[PROTECTED_EMAIL]",
        text,
    )

    # Mask US and international phone numbers
    masked = re.sub(
        r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        "[PROTECTED_PHONE]",
        masked,
    )

    return masked


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extracts candidate contact details: email, phone, links, and name."""
    info: Dict[str, Optional[str]] = {
        "name": None,
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
    }

    if not text:
        return info

    # Email
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if email_match:
        info["email"] = email_match.group(0).strip()

    # Phone
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    if phone_match:
        info["phone"] = phone_match.group(0).strip()

    # LinkedIn
    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)/?", text, re.I)
    if linkedin_match:
        info["linkedin"] = linkedin_match.group(0).strip()

    # GitHub
    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)/?", text, re.I)
    if github_match:
        info["github"] = github_match.group(0).strip()

    # Candidate Name heuristic (first non-empty line with 2-4 capitalized words)
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:5]:
        # Filter out common header words
        if any(h in line.lower() for h in ["resume", "curriculum", "cv", "page", "http", "@"]):
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and all(w.isalpha() or "-" in w for w in words):
            info["name"] = line
            break

    if not info["name"] and lines:
        info["name"] = lines[0][:40]

    return info


def detect_resume_sections(text: str) -> Dict[str, bool]:
    """Detects presence of essential ATS resume sections."""
    if not text:
        return {}

    lowered = text.lower()

    section_keywords = {
        "Summary / Objective": ["summary", "objective", "profile", "about me", "professional summary", "overview"],
        "Experience": ["experience", "employment", "work history", "work experience", "professional experience", "career"],
        "Education": ["education", "academic", "degree", "university", "college", "school"],
        "Skills": ["skills", "technical skills", "technologies", "competencies", "expertise", "core competencies"],
        "Projects": ["projects", "personal projects", "portfolio", "key projects", "academic projects"],
        "Certifications": ["certification", "certifications", "licenses", "credentials", "courses"],
    }

    results: Dict[str, bool] = {}
    for section_name, patterns in section_keywords.items():
        found = False
        for pat in patterns:
            # Word boundary regex looking for header-like appearances
            regex = rf"(?:^|\n)\s*(?:[#*\-•\d.]*\s*)?{re.escape(pat)}[:\s\-–—\n]"
            if re.search(regex, lowered):
                found = True
                break
        results[section_name] = found

    return results
