import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Get database URL from environment variables, fallback to local SQLite for easy development
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DB_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'origen_canino.db')}"

# SQLAlchemy engine setup
# If SQLite is used, check_same_thread=False is required for FastAPI multithreading
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy declarative models
Base = declarative_base()

# Dependency to yield database sessions in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
