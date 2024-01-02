from dotenv import load_dotenv
import os


load_dotenv()  # overridden in production

FASTAPI_ENV = os.environ.get("FASTAPI_ENV")

CSRF_SECRET = os.environ.get("CSRF_SECRET", "secret")

TENANT_ID = os.environ.get("TENANT_ID")
APP_CLIENT_ID = os.environ.get("APP_CLIENT_ID")
OPENAPI_CLIENT_ID = os.environ.get("OPENAPI_CLIENT_ID")

DATABASE_USERNAME = os.environ.get("DATABASE_USERNAME", "postgres")
DATABASE_PASSWORD = os.environ.get("DATABASE_PASSWORD", "postgres")
DATABASE_DOMAIN = os.environ.get("DATABASE_DOMAIN", "db")
DATABASE_SSL = os.environ.get("DATABASE_SSL", "false")
