"""PDF Report Generator for HireLens AI using ReportLab."""

import io
from datetime import datetime
from typing import Any, Dict, List
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_pdf_report(
    candidate_name: str,
    job_title: str,
    score_data: Dict[str, Any],
    skill_data: Dict[str, Any],
    ats_data: Dict[str, Any],
    recommendations: Dict[str, Any],
) -> bytes:
    """Generates an executive PDF report summarizing the resume-job analysis.

    Returns:
        Raw bytes representing the PDF file.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B"),
    )
    section_h1 = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1E293B"),
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )
    score_callout = ParagraphStyle(
        "ScoreCallout",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        textColor=colors.HexColor("#2563EB"),
        alignment=1,
    )
    score_sub = ParagraphStyle(
        "ScoreSub",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1E293B"),
        alignment=1,
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>HIRELENS AI</b> &bull; Executive Candidate Match Report", title_style),
            Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style),
        ],
        [
            Paragraph(f"<b>Candidate:</b> {candidate_name} &nbsp;|&nbsp; <b>Target Role:</b> {job_title}", subtitle_style),
            Paragraph("Evaluation Standard: SaaS v1.0", subtitle_style),
        ]
    ]
    header_table = Table(header_data, colWidths=[380, 160])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=14))

    # 2. Executive Score Summary
    overall_score = score_data.get("overall_score", 0.0)
    tier_label = score_data.get("tier_label", "Evaluation")
    tier_desc = score_data.get("tier_desc", "")

    summary_data = [
        [
            Paragraph(f"{overall_score}%", score_callout),
            Paragraph(
                f"<b>Overall Compatibility: {tier_label}</b><br/>"
                f"<font color='#64748B'>{tier_desc}</font><br/><br/>"
                f"HireLens AI evaluated this resume using multi-layer lexical, semantic vector, and structural ATS parsing algorithms.",
                body_style,
            )
        ]
    ]
    summary_table = Table(summary_data, colWidths=[120, 420])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("PADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    # 3. 4-Pillar Score Breakdown
    story.append(Paragraph("1. Evaluation Pillars Breakdown", section_h1))
    story.append(Spacer(1, 6))

    sub_scores = score_data.get("sub_scores", {})
    pillar_rows = [
        [
            Paragraph("<b>Pillar</b>", body_style),
            Paragraph("<b>Weight</b>", body_style),
            Paragraph("<b>Score</b>", body_style),
            Paragraph("<b>Points Earned</b>", body_style),
        ],
        [
            Paragraph("Skills Overlap", body_style),
            Paragraph("40%", body_style),
            Paragraph(f"{sub_scores.get('skill_score', 0)}%", body_style),
            Paragraph(f"{round(sub_scores.get('skill_score', 0) * 0.40, 1)} pts", body_style),
        ],
        [
            Paragraph("Semantic Context Alignment", body_style),
            Paragraph("30%", body_style),
            Paragraph(f"{sub_scores.get('semantic_score', 0)}%", body_style),
            Paragraph(f"{round(sub_scores.get('semantic_score', 0) * 0.30, 1)} pts", body_style),
        ],
        [
            Paragraph("Keyword / TF-IDF Overlap", body_style),
            Paragraph("15%", body_style),
            Paragraph(f"{sub_scores.get('keyword_score', 0)}%", body_style),
            Paragraph(f"{round(sub_scores.get('keyword_score', 0) * 0.15, 1)} pts", body_style),
        ],
        [
            Paragraph("ATS Compliance & Formatting", body_style),
            Paragraph("15%", body_style),
            Paragraph(f"{ats_data.get('ats_score', 0)}%", body_style),
            Paragraph(f"{round(ats_data.get('ats_score', 0) * 0.15, 1)} pts", body_style),
        ],
    ]
    pillar_table = Table(pillar_rows, colWidths=[200, 100, 120, 120])
    pillar_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(pillar_table)
    story.append(Spacer(1, 14))

    # 4. Skills Analysis
    story.append(Paragraph("2. Skills Match & Gaps Analysis", section_h1))
    story.append(Spacer(1, 6))

    matched_skills = ", ".join(skill_data.get("matched_skills", [])) or "None identified"
    missing_skills = ", ".join(skill_data.get("missing_skills", [])) or "None! 100% matched"

    skills_summary_rows = [
        [
            Paragraph("<b>Matched Skills</b>", body_style),
            Paragraph(matched_skills, body_style),
        ],
        [
            Paragraph("<b>Missing Skills (Gaps)</b>", body_style),
            Paragraph(f"<font color='#DC2626'><b>{missing_skills}</b></font>", body_style),
        ]
    ]
    skills_table = Table(skills_summary_rows, colWidths=[150, 390])
    skills_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F8FAFC")),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 14))

    # 5. ATS Compliance Highlights
    story.append(Paragraph("3. ATS Compliance & Structure Audit", section_h1))
    story.append(Spacer(1, 6))

    checklist = ats_data.get("checklist", [])
    checklist_rows = [
        [
            Paragraph("<b>Audit Item</b>", body_style),
            Paragraph("<b>Status</b>", body_style),
            Paragraph("<b>Findings & Feedback</b>", body_style),
        ]
    ]
    for item in checklist[:6]:
        status_text = "<font color='#10B981'>PASS</font>" if item["passed"] else "<font color='#EF4444'>WARNING</font>"
        checklist_rows.append([
            Paragraph(item["item"], body_style),
            Paragraph(status_text, body_style),
            Paragraph(item["detail"], body_style),
        ])

    checklist_table = Table(checklist_rows, colWidths=[180, 80, 280])
    checklist_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(checklist_table)
    story.append(Spacer(1, 14))

    # 6. Actionable Recommendations
    story.append(Paragraph("4. Prioritized Improvement Plan", section_h1))
    story.append(Spacer(1, 6))

    crit = recommendations.get("critical_fixes", [])
    skills_rec = recommendations.get("skill_enhancements", [])
    all_recs = (crit + skills_rec)[:4]

    if all_recs:
        for idx, rec in enumerate(all_recs, 1):
            title = rec.get("title", "")
            desc = rec.get("desc", "")
            impact = rec.get("impact", "")
            p = Paragraph(
                f"<b>{idx}. {title}</b> ({impact})<br/>"
                f"<font color='#475569'>{desc}</font>",
                body_style,
            )
            story.append(p)
            story.append(Spacer(1, 6))
    else:
        story.append(Paragraph("No critical red flags detected. Resume shows high baseline ATS quality.", body_style))

    # Build document
    doc.build(story)
    return buffer.getvalue()
