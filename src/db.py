import os
from dotenv import load_dotenv
from sqlmodel import create_engine

# Must be imported before calling
# SQLModel.metadata.create_all() and SQLModel.metadata.drop_all()
from . import models

# TODO: Load database url from environment
load_dotenv()
database_url = os.environ.get("DATABASE_URL")

# TODO: Set echo to true for debugging
engine = create_engine(database_url)
