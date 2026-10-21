"""Evaluation Scan History and Score Progression routes."""

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.scan import ResumeScan
from app.models.user import User
from app.schemas.history import HistoryProgressionResponse, ScanSummaryItem

router = APIRouter(prefix="/history", tags=["History & Progression"])


@router.get("/scans", response_model=HistoryProgressionResponse)
def get_user_scan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all past resume evaluation scans for the authenticated user with score trends."""
    scans = (
        db.query(ResumeScan)
        .filter(ResumeScan.user_id == current_user.id)
        .order_by(ResumeScan.created_at.desc())
        .all()
    )

    items = []
    scores = []
    for s in scans:
        items.append(
            ScanSummaryItem(
                id=s.id,
                candidate_name=s.candidate_name,
                job_title=s.job_title,
                overall_score=s.overall_score,
                tier_label=s.tier_label,
                skill_score=s.skill_score,
                ats_score=s.ats_score,
                matched_skills=s.matched_skills or [],
                missing_skills=s.missing_skills or [],
                created_at=s.created_at,
            )
        )
        scores.append(s.overall_score)

    total = len(items)
    avg_score = round(sum(scores) / total, 1) if total > 0 else 0.0
    highest = round(max(scores), 1) if total > 0 else 0.0

    # Score improvement: difference between most recent scan and oldest scan
    score_improvement = 0.0
    if total >= 2:
        score_improvement = round(scores[0] - scores[-1], 1)

    return HistoryProgressionResponse(
        scans=items,
        total_scans=total,
        average_score=avg_score,
        highest_score=highest,
        score_improvement=score_improvement,
    )


@router.get("/scans/{scan_id}")
def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieves complete analysis results payload for re-loading past scan into workspace."""
    scan = (
        db.query(ResumeScan)
        .filter(ResumeScan.id == scan_id, ResumeScan.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan history record not found.",
        )

    return {
        "id": scan.id,
        "candidate_name": scan.candidate_name,
        "job_title": scan.job_title,
        "overall_score": scan.overall_score,
        "created_at": scan.created_at,
        "results": scan.full_results_json or {},
    }


@router.delete("/scans/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan_record(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a saved scan record."""
    scan = (
        db.query(ResumeScan)
        .filter(ResumeScan.id == scan_id, ResumeScan.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan history record not found.",
        )

    db.delete(scan)
    db.commit()
    return None
