"""Central API router combining all endpoint sub-routers."""

from fastapi import APIRouter
from app.api.routes import analyze, auth, chat, health, history, report, resume

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(history.router)
api_router.include_router(resume.router)
api_router.include_router(analyze.router)
api_router.include_router(chat.router)
api_router.include_router(report.router)
