"""Unit tests for parser, PII masking, contact info, and section detection."""

from app.services.parser import (
    clean_text,
    detect_resume_sections,
    extract_contact_info,
    extract_text_from_pdf,
    mask_pii,
)


def test_clean_text_normalizes_whitespace_and_hyphens():
    raw = "Senior   Software  Engi-\nneer  with • 5 years experience."
    cleaned = clean_text(raw)
    assert "Engineer" in cleaned
    assert "- 5 years experience" in cleaned


def test_mask_pii():
    text = "Contact Jane Doe at jane.doe@example.com or call (555) 123-4567."
    masked = mask_pii(text)
    assert "[PROTECTED_EMAIL]" in masked
    assert "[PROTECTED_PHONE]" in masked
    assert "jane.doe@example.com" not in masked
    assert "(555) 123-4567" not in masked


def test_extract_contact_info():
    text = """Alex Chen
    San Francisco, CA | alex.chen@example.com | (555) 987-6543
    https://linkedin.com/in/alexchen https://github.com/alexchen
    PROFESSIONAL SUMMARY
    """
    contact = extract_contact_info(text)
    assert contact["email"] == "alex.chen@example.com"
    assert contact["phone"] == "(555) 987-6543"
    assert "linkedin.com/in/alexchen" in contact["linkedin"]
    assert "github.com/alexchen" in contact["github"]
    assert contact["name"] == "Alex Chen"


def test_detect_resume_sections():
    text = """
    PROFESSIONAL SUMMARY
    Senior Developer with cloud expertise.
    WORK EXPERIENCE
    Software Engineer at TechCorp.
    EDUCATION
    BS Computer Science
    TECHNICAL SKILLS
    Python, Docker, AWS
    PROJECTS
    Open source contributor.
    """
    sections = detect_resume_sections(text)
    assert sections["Summary / Objective"] is True
    assert sections["Experience"] is True
    assert sections["Education"] is True
    assert sections["Skills"] is True
    assert sections["Projects"] is True


def test_extract_text_from_pdf_in_memory(sample_pdf_bytes: bytes):
    res = extract_text_from_pdf(sample_pdf_bytes)
    assert res["success"] is True
    assert res["page_count"] >= 1
    assert "Jane Doe" in res["text"]
    assert res["word_count"] > 50
