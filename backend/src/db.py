from sqlmodel import create_engine

# Must be imported beforehand to setup SQLModel.metadata
from . import models
from .env import (
    FASTAPI_ENV,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
)

DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
engine = create_engine(DATABASE_URL)
