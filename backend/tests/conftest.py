"""Pytest configuration and synthetic test fixtures."""

import io
import os
import sys
import pytest
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph, SimpleDocTemplate
from reportlab.lib.styles import getSampleStyleSheet

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import init_db
# Initialize database tables for tests
try:
    init_db()
except Exception:
    pass


@pytest.fixture
def sample_resume_text() -> str:
    """Clean synthetic resume text fixture for testing without external sample files."""
    return """Jane Doe
San Francisco, CA | jane.doe@example.com | (555) 234-5678
LinkedIn: linkedin.com/in/janedoe | GitHub: github.com/janedoe

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years of experience architecting distributed cloud systems, building RESTful microservices, and leading Agile teams. Spearheaded cloud modernization saving $120,000 annually.

TECHNICAL SKILLS
- Programming Languages: Python, Go, SQL, Bash
- Frameworks & Tools: FastAPI, Docker, Kubernetes, CI/CD, Git
- Cloud & Infrastructure: AWS, PostgreSQL, Redis, Linux
- Practices: Agile, Scrum, Unit Testing, System Design

PROFESSIONAL EXPERIENCE
Lead Backend Engineer | CloudNova Systems | 2021 - Present
- Architected 10+ high-throughput microservices using Python and FastAPI on AWS.
- Spearheaded database query optimization reducing p99 latency by 42% for 500k daily active users.
- Automated CI/CD pipelines using GitHub Actions, decreasing build failures by 35%.
- Mentored 5 junior software engineers in clean code and unit testing.

Software Engineer | Apex Infotech | 2018 - 2021
- Developed scalable REST APIs using Python and PostgreSQL handling 2M requests daily.
- Built automated data ingestion workflows saving 15 hours of manual work weekly.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2018

PROJECTS
OpenSource Distributed Task Runner: Built a fault-tolerant job scheduler in Go and Redis with 1.2k GitHub stars.
"""


@pytest.fixture
def sample_jd_text() -> str:
    """Clean synthetic job description text fixture."""
    return """Position: Senior Python Backend Engineer
Company: CloudScale AI
Location: Remote

Responsibilities:
- Architect and develop scalable backend microservices using Python, FastAPI, and Docker.
- Deploy and manage containerized applications using Kubernetes on AWS cloud infrastructure.
- Design database schemas and optimize queries with PostgreSQL and Redis.
- Implement CI/CD deployment pipelines and automated unit testing.
- Collaborate with cross-functional teams in an Agile environment.

Requirements:
- 4+ years of professional backend engineering experience with Python.
- Hands-on experience with FastAPI, Docker, Kubernetes, and AWS.
- Strong knowledge of PostgreSQL, Redis, and RESTful API architecture.
- Demonstrated problem solving, leadership, and communication skills.
"""


@pytest.fixture
def sample_pdf_bytes(sample_resume_text: str) -> bytes:
    """Generates a valid in-memory PDF byte stream for parser testing."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    for line in sample_resume_text.split("\n"):
        if line.strip():
            story.append(Paragraph(line.strip(), styles["Normal"]))
    doc.build(story)
    return buffer.getvalue()
