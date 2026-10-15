"""Comprehensive skill taxonomy, boundary-safe skill extraction, and keyword analysis."""

import re
from typing import Any, Dict, List, Set, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer

# Curated skills taxonomy grouped by technical and domain categories
SKILL_TAXONOMY: Dict[str, List[str]] = {
    "Programming Languages": [
        "Python", "Java", "C++", "C#", "C", "TypeScript", "JavaScript",
        "Golang", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala",
        "R", "SQL", "Bash", "Shell", "PowerShell", "Dart", "Perl", "Lua",
        "HTML5", "CSS3", "HTML", "CSS", "Sass"
    ],
    "AI & Machine Learning": [
        "Machine Learning", "Deep Learning", "Natural Language Processing", "NLP",
        "Computer Vision", "Large Language Models", "LLMs", "LLM", "Generative AI",
        "GenAI", "Transformers", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn",
        "Pandas", "NumPy", "SciPy", "OpenCV", "HuggingFace", "LangChain",
        "LlamaIndex", "RAG", "Prompt Engineering", "Fine-Tuning", "Vector Databases",
        "FAISS", "ChromaDB", "Pinecone", "Milvus", "Reinforcement Learning",
        "Data Science", "Feature Engineering", "Data Modeling", "ETL", "Jupyter"
    ],
    "Web & Backend Frameworks": [
        "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Node.js",
        "Express", "Express.js", "Django", "FastAPI", "Flask", "Spring",
        "Spring Boot", "ASP.NET", ".NET", ".NET Core", "Ruby on Rails", "NestJS",
        "GraphQL", "REST APIs", "REST API", "RESTful", "WebSockets", "Microservices",
        "Tailwind CSS", "Bootstrap", "Redux", "Redux Toolkit", "Zustand"
    ],
    "Cloud & DevOps": [
        "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud",
        "Docker", "Kubernetes", "K8s", "CI/CD", "Terraform", "Ansible",
        "Jenkins", "GitHub Actions", "GitLab CI", "Git", "GitHub", "GitLab",
        "Linux", "Unix", "Serverless", "AWS Lambda", "CloudFormation", "Helm",
        "Prometheus", "Grafana", "Nginx", "Apache", "ArgoCD"
    ],
    "Databases & Big Data": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra",
        "DynamoDB", "Oracle", "Microsoft SQL Server", "Snowflake", "BigQuery",
        "Databricks", "Apache Spark", "Spark", "Kafka", "Apache Kafka", "Hadoop",
        "Elasticsearch", "Neo4j", "Firebase", "Supabase", "Superset"
    ],
    "Engineering Practices & Architecture": [
        "System Design", "Distributed Systems", "Object-Oriented Programming", "OOP",
        "Design Patterns", "Clean Architecture", "Microservices Architecture",
        "Test-Driven Development", "TDD", "Unit Testing", "Integration Testing",
        "Code Review", "Agile", "Scrum", "Kanban", "DevOps", "Site Reliability Engineering", "SRE"
    ],
    "Tools & Platforms": [
        "Jira", "Confluence", "Postman", "Swagger", "Figma", "VS Code",
        "Tableau", "Power BI", "Excel", "Notion", "Slack", "Trello", "Datadog", "Splunk"
    ],
    "Soft Skills & Leadership": [
        "Leadership", "Communication", "Problem Solving", "Critical Thinking",
        "Team Collaboration", "Mentorship", "Project Management", "Time Management",
        "Adaptability", "Stakeholder Management", "Cross-Functional Collaboration",
        "Decision Making", "Analytical Skills", "Strategic Planning"
    ],
}

# Regex patterns for tricky single-letter or symbol-heavy skills to avoid false positives
SPECIAL_SKILL_PATTERNS: Dict[str, str] = {
    "C": r"(?:\bC\b(?!\+\+|#))",
    "C++": r"\bC\+\+",
    "C#": r"\bC#|\bC-sharp\b",
    ".NET": r"(?:\.NET|\bdot\s*net\b)",
    ".NET Core": r"(?:\.NET\s*Core|\bdotnet\s*core\b)",
    "Go": r"(?:\bGolang\b|\bGo\s+programming\b|\bGo\s+developer\b|\bGo\s+language\b)",
    "R": r"(?:\bR\s+programming\b|\bR\s+language\b|\bR\s+package\b|\bRStudio\b|\busing\s+R\b)",
    "CI/CD": r"(?:\bCI/CD\b|\bCI\s*-\s*CD\b|\bcontinuous\s+integration\b)",
    "REST API": r"(?:\bREST\s*APIs?\b|\bRESTful\b)",
    "REST APIs": r"(?:\bREST\s*APIs?\b|\bRESTful\b)",
    "LLM": r"(?:\bLLMs?\b|\blarge\s+language\s+models?\b)",
    "LLMs": r"(?:\bLLMs?\b|\blarge\s+language\s+models?\b)",
    "GenAI": r"(?:\bGenAI\b|\bgenerative\s+ai\b)",
    "Generative AI": r"(?:\bGenAI\b|\bgenerative\s+ai\b)",
    "K8s": r"(?:\bK8s\b|\bKubernetes\b)",
    "Next.js": r"(?:\bNext\.js\b|\bNextjs\b)",
    "Vue.js": r"(?:\bVue\.js\b|\bVuejs\b|\bVue\b)",
    "Node.js": r"(?:\bNode\.js\b|\bNodejs\b|\bNode\b)",
    "Express.js": r"(?:\bExpress\.js\b|\bExpressjs\b)",
    "React.js": r"(?:\bReact\.js\b|\bReactjs\b|\bReact\b)",
}


def normalize_skill_name(skill: str) -> str:
    """Normalizes alias skill names into a canonical form."""
    aliases = {
        "react.js": "React",
        "reactjs": "React",
        "vue.js": "Vue",
        "vuejs": "Vue",
        "node.js": "Node.js",
        "nodejs": "Node.js",
        "express.js": "Express",
        "expressjs": "Express",
        "k8s": "Kubernetes",
        "amazon web services": "AWS",
        "google cloud": "GCP",
        "large language models": "LLMs",
        "llm": "LLMs",
        "genai": "Generative AI",
        "golang": "Go",
        "rest apis": "REST APIs",
        "rest api": "REST APIs",
        "restful": "REST APIs",
        "natural language processing": "NLP",
    }
    lower = skill.strip().lower()
    return aliases.get(lower, skill.strip())


def extract_skills(text: str) -> Dict[str, Any]:
    """Scans text and extracts recognized technical, analytical, and soft skills.

    Returns:
        Dict with:
        - 'skills': List of unique canonical skills found.
        - 'skills_by_category': Dict mapping category to list of skills found.
        - 'total_count': Total number of detected skills.
    """
    if not text:
        return {"skills": [], "skills_by_category": {}, "total_count": 0}

    detected_skills: Set[str] = set()
    category_map: Dict[str, List[str]] = {}

    for category, skills in SKILL_TAXONOMY.items():
        category_map[category] = []
        for skill in skills:
            found = False
            # Check for special pattern override first
            if skill in SPECIAL_SKILL_PATTERNS:
                pattern = SPECIAL_SKILL_PATTERNS[skill]
                if re.search(pattern, text, re.IGNORECASE):
                    found = True
            else:
                # Boundary match for standard names
                escaped = re.escape(skill)
                pattern = rf"\b{escaped}\b"
                if re.search(pattern, text, re.IGNORECASE):
                    found = True

            if found:
                canonical = normalize_skill_name(skill)
                detected_skills.add(canonical)
                if canonical not in category_map[category]:
                    category_map[category].append(canonical)

    # Clean up empty categories
    cleaned_categories = {k: sorted(v) for k, v in category_map.items() if v}

    return {
        "skills": sorted(list(detected_skills)),
        "skills_by_category": cleaned_categories,
        "total_count": len(detected_skills),
    }


def compare_skills(
    resume_skills: List[str], jd_skills: List[str]
) -> Dict[str, Any]:
    """Compares resume skills against job description skills.

    Returns:
        Dict containing matched skills, missing skills, bonus skills, and match ratio.
    """
    resume_set = {normalize_skill_name(s).lower() for s in resume_skills}
    jd_set = {normalize_skill_name(s).lower() for s in jd_skills}

    # Case-preserving map
    resume_map = {normalize_skill_name(s).lower(): normalize_skill_name(s) for s in resume_skills}
    jd_map = {normalize_skill_name(s).lower(): normalize_skill_name(s) for s in jd_skills}

    matched_keys = resume_set.intersection(jd_set)
    missing_keys = jd_set - resume_set
    bonus_keys = resume_set - jd_set

    matched = sorted([jd_map[k] for k in matched_keys])
    missing = sorted([jd_map[k] for k in missing_keys])
    bonus = sorted([resume_map[k] for k in bonus_keys])

    total_jd = len(jd_set)
    match_ratio = (len(matched_keys) / total_jd) if total_jd > 0 else 1.0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "bonus_skills": bonus,
        "matched_count": len(matched),
        "missing_count": len(missing),
        "bonus_count": len(bonus),
        "total_required": total_jd,
        "match_percentage": round(match_ratio * 100, 1),
    }


def extract_keywords(text: str, top_n: int = 20) -> List[Tuple[str, float]]:
    """Extracts top salient n-grams using TF-IDF."""
    if not text or len(text.strip().split()) < 5:
        return []

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=50,
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z0-9_\-\+]{1,}\b",
        )
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]

        scored_words = [
            (feature_names[i], float(scores[i]))
            for i in range(len(feature_names))
            if scores[i] > 0
        ]
        scored_words.sort(key=lambda x: x[1], reverse=True)
        return scored_words[:top_n]
    except Exception:
        # Fallback to simple word frequency
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        stopwords = {
            "the", "and", "for", "with", "that", "this", "from", "have", "are",
            "you", "your", "will", "our", "all", "can", "has", "was", "been",
        }
        filtered = [w for w in words if w not in stopwords]
        freq: Dict[str, int] = {}
        for w in filtered:
            freq[w] = freq.get(w, 0) + 1
        sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [(word, float(count)) for word, count in sorted_freq[:top_n]]
