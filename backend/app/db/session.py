"""Database connection and session management with resilient PostgreSQL & SQLite support."""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("hirelens.db")

Base = declarative_base()

def get_configured_engine():
    """Initializes SQLAlchemy engine for PostgreSQL, falling back to SQLite if unreachable."""
    db_url = settings.DATABASE_URL

    if db_url.startswith("postgresql"):
        try:
            # Test PostgreSQL connectivity with a short timeout
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3},
            )
            # Test simple connection
            with engine.connect() as conn:
                pass
            logger.info("Successfully connected to PostgreSQL database.")
            return engine, "postgresql"
        except Exception as exc:
            logger.warning(
                f"Could not connect to PostgreSQL ({exc}). Falling back to local SQLite 'hirelens_dev.db'."
            )

    # Fallback to SQLite
    sqlite_url = "sqlite:///./hirelens_dev.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    return engine, "sqlite"


engine, db_dialect = get_configured_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from sqlalchemy import text


def init_db():
    """Creates all database tables defined in models and applies backward-compatible column migrations."""
    from app.models import scan, user  # Ensure models are imported
    Base.metadata.create_all(bind=engine)

    # Safe migrations for existing SQLite / PostgreSQL tables
    with engine.connect() as conn:
        for col, col_def in [
            ("auth_provider", "VARCHAR(50) DEFAULT 'local'"),
            ("google_id", "VARCHAR(255)"),
            ("reset_token", "VARCHAR(255)"),
            ("reset_token_expires", "DATETIME"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_def}"))
                conn.commit()
            except Exception:
                # Column already exists or table structure is fresh
                pass
