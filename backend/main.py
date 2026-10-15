"""FastAPI application root re-export for uvicorn compatibility."""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
