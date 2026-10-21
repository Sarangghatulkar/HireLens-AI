"""HireLens AI - FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization notice: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router with /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint redirecting to health information."""
    return {
        "message": "HireLens AI Backend API is running.",
        "docs": "/docs",
        "health": "/api/health",
    }
