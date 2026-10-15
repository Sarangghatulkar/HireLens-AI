"""Unit tests for skill extraction, boundary regex matching, and keyword analysis."""

from app.services.skill_extractor import compare_skills, extract_keywords, extract_skills


def test_extract_skills_programming_and_ai():
    text = "Proficient in Python, C++, PyTorch, Docker, Kubernetes, and PostgreSQL with Agile leadership."
    res = extract_skills(text)
    skills = res["skills"]
    assert "Python" in skills
    assert "C++" in skills
    assert "PyTorch" in skills
    assert "Docker" in skills
    assert "Kubernetes" in skills
    assert "PostgreSQL" in skills
    assert "Agile" in skills
    assert "Leadership" in skills


def test_special_skill_boundaries():
    # 'Go' should not match inside 'Good'
    text_false = "A very Good developer in Chicago City."
    res_false = extract_skills(text_false)
    assert "Go" not in res_false["skills"]
    assert "C" not in res_false["skills"]

    # 'Golang' or 'Go programming' should match
    text_true = "Experienced in Golang, R programming, and C++ backend systems."
    res_true = extract_skills(text_true)
    assert "Go" in res_true["skills"]
    assert "C++" in res_true["skills"]
    assert "R" in res_true["skills"]


def test_compare_skills():
    resume_skills = ["Python", "FastAPI", "Docker", "PostgreSQL", "Git"]
    jd_skills = ["Python", "FastAPI", "Kubernetes", "AWS", "Docker"]

    comp = compare_skills(resume_skills, jd_skills)

    assert set(comp["matched_skills"]) == {"Python", "FastAPI", "Docker"}
    assert set(comp["missing_skills"]) == {"Kubernetes", "AWS"}
    assert set(comp["bonus_skills"]) == {"PostgreSQL", "Git"}
    assert comp["matched_count"] == 3
    assert comp["missing_count"] == 2
    assert comp["match_percentage"] == 60.0


def test_extract_keywords():
    text = "Machine learning engineers build predictive models and neural network systems."
    keywords = extract_keywords(text, top_n=5)
    assert len(keywords) > 0
    words = [k[0] for k in keywords]
    assert any("machine" in w or "learning" in w or "predictive" in w for w in words)
