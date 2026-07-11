from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from redis import Redis
import logging
from app.config import settings

logger = logging.getLogger("facevision.db")

# SQLAlchemy connection engine
# Using pool_pre_ping=True for robust database reconnection handling in production Cloud Run environments
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Redis Session & Cache client
try:
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.error(f"Failed to connect to Redis cache cluster: {e}")
    redis_client = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
