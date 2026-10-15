# 🎯 HireLens AI – Full-Stack Resume Analyzer & Job Matcher

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3%2B-646CFF.svg)](https://vite.dev/)
[![Sentence%20Transformers](https://img.shields.io/badge/Sentence%20Transformers-all--MiniLM--L6--v2-orange.svg)](https://sbert.net/)
[![ReportLab](https://img.shields.io/badge/PDF%20Generation-ReportLab-emerald.svg)](https://www.reportlab.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**HireLens AI** is an enterprise-grade full-stack platform designed to evaluate candidate resumes against target job descriptions, calculate explainable composite match scores, audit ATS (Applicant Tracking System) compliance, and deliver actionable career coaching.

Built with a high-performance **FastAPI** backend and a modern **React 19 + Vite** frontend.

---

## 🌟 Key Features

1. **🎨 Clean, Enterprise SaaS Workspace**
   - Drag & drop PDF/TXT resume parser with in-memory text normalization.
   - Word counters, formatting alerts, and candidate privacy mode with one-click **PII Masking** (redacting phone numbers and emails).

2. **⚖️ Spotlight Diagnostics (What's Right vs. What's Wrong)**
   - **✅ What's Right**: Verified strengths, matched skills, assertive power action verbs (*Architected, Spearheaded*), quantified metrics & KPIs (`35%`, `$150k`), and complete standard sections.
   - **❌ What's Wrong**: Specific red flags, critical missing skills, passive duty phrases (*Responsible for, Worked on*), formatting and density warnings.

3. **💬 Real-Time AI Career Copilot ("Talk with AI")**
   - Interactive, conversational AI assistant with **complete context** of the candidate's resume, target job description, matched/missing skills, and ATS audit.
   - Instant quick prompt pills:
     * 🎯 *"How do I fix missing skills?"*
     * ✍️ *"Rewrite my top bullet point with STAR method"*
     * 📊 *"Explain why I received this match score"*
     * 🎤 *"Give me 3 technical interview questions for this role"*
   - Dual-engine: Works live with **Google Gemini API** when a key is provided, or uses the intelligent context-aware local NLP engine when offline.

4. **💼 Smart Job Description & Skills Taxonomy**
   - Curated taxonomy of **250+ technical, cloud, AI/ML, data, web, and soft skills**.
   - Word-boundary aware extraction preventing false positives (e.g., handles `C`, `C++`, `C#`, `Go`, `R`, `CI/CD`, `.NET`).
   - Salient domain keyword extraction using TF-IDF n-grams (unigrams and bigrams).

5. **📊 Explainable 4-Pillar Match Score (0–100%)**
   - **Skills Overlap (40%)**: Ratio of matched vs required job skills.
   - **Semantic Alignment (30%)**: Deep contextual vector similarity via `sentence-transformers` (`all-MiniLM-L6-v2`) with local cache priority and fallback.
   - **Keyword Match (15%)**: TF-IDF lexical cosine similarity.
   - **ATS & Structure (15%)**: Section completeness, contact info, power verbs, and quantified metrics.

6. **📋 Rigorous ATS Compliance Audit**
   - **Essential Section Headers**: Verifies presence of Experience, Education, Skills, Summary, and Projects.
   - **Action Verbs Density**: Detects 90+ high-impact leadership verbs (*Architected, Spearheaded, Accelerated, Optimized*) vs passive duty phrasing (*Responsible for, Worked on*).
   - **Quantifiable Metrics Detection**: Identifies percentages, dollar values, multipliers, and scale indicators.
   - **Readability & Formatting**: Calculates Flesch Reading Ease score and word count range (optimal 350–900 words).

7. **📥 Downloadable Executive PDF Reports**
   - Generates professional, recruiter-ready PDF reports with ReportLab.
   - Includes score breakdown tables, skill gap matrices, ATS audit items, and prioritized action items.

---

## 🏗️ Clean Full-Stack Architecture

```
d:/InsightAI/
├── backend/                       # Python FastAPI REST API Server
│   ├── app/
│   │   ├── main.py                # FastAPI application initialization & CORS
│   │   ├── core/                  # Configurations, settings, and security
│   │   │   ├── config.py          # Environment settings (Pydantic / os.getenv)
│   │   │   └── security.py        # Input sanitization and PII masking helpers
│   │   ├── schemas/               # Pydantic request & response models
│   │   │   ├── analyze.py         # AnalyzeRequest schema
│   │   │   ├── chat.py            # ChatMessage, ChatRequest schema
│   │   │   └── report.py          # ReportRequest schema
│   │   ├── services/              # Business logic & AI intelligence engines
│   │   │   ├── parser.py          # In-memory PDF/TXT extraction & section detection
│   │   │   ├── skill_extractor.py # 250+ skill taxonomy & boundary-safe regexes
│   │   │   ├── ats_checker.py     # ATS audit, power verbs, and quantified metrics
│   │   │   ├── scorer.py          # Sentence Transformers & TF-IDF composite scoring
│   │   │   ├── recommender.py     # Rule-based & Gemini-enhanced recommendations
│   │   │   ├── chat_assistant.py  # Dual-mode AI Career Copilot engine
│   │   │   └── pdf_report.py      # ReportLab executive PDF generator
│   │   └── api/                   # REST API layer
│   │       ├── router.py          # Central router aggregating sub-routers
│   │       └── routes/
│   │           ├── health.py      # GET /api/health
│   │           ├── resume.py      # POST /api/upload-resume
│   │           ├── analyze.py     # POST /api/analyze
│   │           ├── chat.py        # POST /api/chat
│   │           └── report.py      # POST /api/download-report
│   ├── tests/                     # 28 passing pytest unit & integration tests
│   │   ├── conftest.py            # Clean test fixtures (independent of external files)
│   │   ├── test_api_endpoints.py  # TestClient REST route tests
│   │   ├── test_ats_checker.py    # ATS audit tests
│   │   ├── test_chat_assistant.py # AI Copilot tests
│   │   ├── test_parser.py         # In-memory PDF extraction & PII masking tests
│   │   ├── test_recommender_and_pdf.py # Recommendations & PDF generation tests
│   │   ├── test_scorer.py         # Scoring & semantic similarity tests
│   │   └── test_skill_extractor.py# Skill taxonomy boundary regex tests
│   ├── run.py                     # Backend server entrypoint (`python run.py`)
│   ├── main.py                    # Root re-export for `uvicorn main:app`
│   ├── requirements.txt           # Pinned Python dependencies
│   └── .env.example               # Backend environment variables
│
├── frontend/                      # Modern React 19 + Vite Single-Page Application
│   ├── src/
│   │   ├── main.jsx               # React DOM entrypoint
│   │   ├── App.jsx                # Main application state & dashboard
│   │   ├── index.css              # Custom design system & animations
│   │   ├── services/
│   │   │   └── api.js             # Centralized REST API client
│   │   └── components/
│   │       ├── Header.jsx         # Navigation, PII toggle & Gemini API Key modal
│   │       ├── Hero.jsx           # Clean hero section with "Start Here" CTA
│   │       ├── Workspace.jsx      # Resume drag-and-drop & job description text input
│   │       ├── ScoreOverview.jsx  # SVG gauge chart & 4-pillar breakdown
│   │       ├── SpotlightRightWrong.jsx # What's Right vs. What's Wrong diagnostics
│   │       ├── SkillsMatrix.jsx   # Matched, Missing, and Bonus skills chips
│   │       ├── AtsAudit.jsx       # ATS compliance checklist & verb counter
│   │       ├── StrengthsWeaknessesDetail.jsx # Deep dive & STAR bullet rewrites
│   │       ├── AiChatCopilot.jsx  # Career Copilot chat interface
│   │       └── Inspector.jsx      # Raw text & PII masking preview
│   ├── package.json               # Frontend dependencies & scripts
│   ├── vite.config.js             # Vite config with /api proxy to port 8000
│   └── .env.example               # Frontend environment template
│
├── .gitignore
├── .env.example                   # Workspace environment template
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup & Run (FastAPI on Port 8000)

```powershell
# Navigate to backend directory
cd d:\InsightAI\backend

# (Optional) Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
# Alternatively:
# python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

### 2. Frontend Setup & Run (React + Vite on Port 5173)

```powershell
# Navigate to frontend directory
cd d:\InsightAI\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- **Frontend Application**: `http://localhost:5173`

---

### 3. Run Backend Test Suite

```powershell
cd d:\InsightAI\backend
python -m pytest tests/ -v
```

All 28 unit and API integration tests execute with 100% pass rate:
```text
tests/test_api_endpoints.py::test_health_endpoint PASSED
tests/test_api_endpoints.py::test_root_endpoint PASSED
tests/test_api_endpoints.py::test_analyze_endpoint PASSED
tests/test_api_endpoints.py::test_analyze_empty_request PASSED
tests/test_api_endpoints.py::test_chat_endpoint PASSED
tests/test_api_endpoints.py::test_upload_resume_endpoint_txt PASSED
tests/test_api_endpoints.py::test_download_report_endpoint PASSED
tests/test_ats_checker.py::test_audit_ats_compliance_complete_resume PASSED
tests/test_ats_checker.py::test_audit_ats_empty_resume PASSED
tests/test_chat_assistant.py::test_build_system_context PASSED
tests/test_chat_assistant.py::test_generate_offline_chat_response_missing_skills PASSED
tests/test_chat_assistant.py::test_generate_offline_chat_response_star_rewrite PASSED
tests/test_chat_assistant.py::test_chat_with_copilot_fallback_to_offline PASSED
tests/test_parser.py::test_clean_text_normalizes_whitespace_and_hyphens PASSED
tests/test_parser.py::test_mask_pii PASSED
tests/test_parser.py::test_extract_contact_info PASSED
tests/test_parser.py::test_detect_resume_sections PASSED
tests/test_parser.py::test_extract_text_from_pdf_in_memory PASSED
tests/test_recommender_and_pdf.py::test_generate_rule_based_recommendations PASSED
tests/test_recommender_and_pdf.py::test_generate_pdf_report_bytes PASSED
tests/test_scorer.py::test_tfidf_similarity_identical_texts PASSED
tests/test_scorer.py::test_tfidf_similarity_different_texts PASSED
tests/test_scorer.py::test_compute_semantic_similarity PASSED
tests/test_scorer.py::test_calculate_match_score PASSED
tests/test_skill_extractor.py::test_extract_skills_programming_and_ai PASSED
tests/test_skill_extractor.py::test_special_skill_boundaries PASSED
tests/test_skill_extractor.py::test_compare_skills PASSED
tests/test_skill_extractor.py::test_extract_keywords PASSED
======================= 28 passed in 13.35s =======================
```

---

### 4. Build Frontend for Production

```powershell
cd d:\InsightAI\frontend
npm run build
```

---

## 🔒 Security & Privacy

- **In-Memory File Processing**: Uploaded PDF and TXT resumes are parsed in memory and never stored permanently on disk.
- **Client-Side PII Masking**: Easily redact candidate email addresses and phone numbers before analysis or PDF export.
- **Secure API Key Handling**: The optional Gemini API key can be provided via client request or environment variable; it is never logged or persisted.

---

## 📄 License

This project is licensed under the MIT License.
