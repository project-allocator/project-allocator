import os
from dotenv import load_dotenv
from sqlmodel import create_engine

# Must be imported before to setup SQLMode.metadata
from . import models

# Load database url from environment
load_dotenv()
FASTAPI_ENV = os.environ.get("FASTAPI_ENV")
DATABASE_USERNAME = os.environ.get("DATABASE_USERNAME")
DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD")
DATABASE_DOMAIN = os.environ.get("DATABASE_DOMAIN")
DATABASE_SSL = os.environ.get("DATABASE_SSL")

# Azure PostgreSQL requires the username to be in the format of 'username@domain'
if FASTAPI_ENV == "production":
    DATABASE_USERNAME = f"{DATABASE_USERNAME}@{DATABASE_DOMAIN}"

DATABASE_URL = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_DOMAIN}:5432/default{'?sslmode=require' if DATABASE_SSL == 'true' else ''}"

engine = create_engine(DATABASE_URL)
