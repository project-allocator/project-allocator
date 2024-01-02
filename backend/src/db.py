from sqlmodel import create_engine

from .env import (
    FASTAPI_ENV,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_DOMAIN,
    DATABASE_SSL,
)

# Must be imported beforehand to setup SQLModel.metadata
from . import models

# Azure PostgreSQL requires the username to be in the format of 'username@domain'
if FASTAPI_ENV == "production":
    DATABASE_USERNAME = f"{DATABASE_USERNAME}@{DATABASE_DOMAIN}"

DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_DOMAIN}:5432/default{'?sslmode=require' if DATABASE_SSL == 'true' else ''}"

engine = create_engine(DATABASE_URL)
