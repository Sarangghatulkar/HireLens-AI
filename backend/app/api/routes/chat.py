"""AI Career Copilot chat endpoint."""

from fastapi import APIRouter
from app.core.security import resolve_api_key, sanitize_text
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_assistant import chat_with_copilot

router = APIRouter(tags=["Copilot"])


@router.post("/chat", response_model=ChatResponse)
def chat_copilot(req: ChatRequest):
    """Processes interactive career copilot conversation with candidate context."""
    # Convert Pydantic message objects to plain dicts
    messages_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
    
    api_key = resolve_api_key(req.api_key)
    
    response_text, source, model = chat_with_copilot(
        messages=messages_dicts,
        resume_text=sanitize_text(req.resume_text),
        jd_text=sanitize_text(req.jd_text),
        analysis_results=req.analysis_results,
        api_key=api_key,
    )
    return ChatResponse(response=response_text, source=source, model=model)
