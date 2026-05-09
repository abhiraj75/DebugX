from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,        # Test connection liveness before each request
    pool_recycle=300,           # Recycle connections every 5 min (Neon idle timeout)
    pool_size=5,               # Keep 5 connections in pool
    max_overflow=10,            # Allow up to 10 extra connections under load
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

logger.info("Database engine created (URL: %s)", settings.DATABASE_URL)


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    logger.debug("Database session opened")
    try:
        yield db
    finally:
        db.close()
        logger.debug("Database session closed")
