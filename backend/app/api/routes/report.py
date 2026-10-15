"""PDF executive report download endpoint."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.schemas.report import ReportRequest
from app.services.pdf_report import generate_pdf_report

router = APIRouter(tags=["Report"])


@router.post("/download-report")
def download_pdf_report(req: ReportRequest):
    """Generates and returns a downloadable executive PDF report."""
    try:
        pdf_bytes = generate_pdf_report(
            candidate_name=req.candidate_name,
            job_title=req.job_title,
            score_data=req.score_data,
            skill_data=req.skill_data,
            ats_data=req.ats_data,
            recommendations=req.recommendations,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="hirelens_ai_report.pdf"'},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(exc)}")
