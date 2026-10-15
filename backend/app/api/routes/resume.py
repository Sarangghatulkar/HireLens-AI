"""Resume upload and parsing endpoint."""

from fastapi import APIRouter, File, HTTPException, UploadFile
from app.services.parser import clean_text, extract_contact_info, extract_text_from_pdf

router = APIRouter(tags=["Resume"])


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Uploads and parses a PDF or TXT resume completely in-memory."""
    filename = file.filename or "resume"
    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if filename.lower().endswith(".pdf"):
        res = extract_text_from_pdf(content)
        if not res["success"]:
            raise HTTPException(status_code=400, detail=res.get("error", "Failed to parse PDF"))
        contact = extract_contact_info(res["text"])
        return {
            "success": True,
            "filename": filename,
            "text": res["text"],
            "word_count": res["word_count"],
            "page_count": res["page_count"],
            "candidate_name": contact.get("name", "Candidate"),
        }
    else:
        text = clean_text(content.decode("utf-8", errors="ignore"))
        words = len(text.split())
        contact = extract_contact_info(text)
        return {
            "success": True,
            "filename": filename,
            "text": text,
            "word_count": words,
            "page_count": 1,
            "candidate_name": contact.get("name", "Candidate"),
        }
