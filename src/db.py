import os
from dotenv import load_dotenv
from sqlmodel import create_engine

# Must be imported before to setup SQLMode.metadata
from . import models

# TODO: Load database url from environment
load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

# TODO: Set echo to true for debugging
engine = create_engine(DATABASE_URL)
