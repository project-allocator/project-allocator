import os
from dotenv import load_dotenv
from sqlmodel import create_engine

# Must be imported before to setup SQLMode.metadata
from . import models

# Load database url from environment
load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)
