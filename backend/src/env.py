import os

from dotenv import load_dotenv

load_dotenv()  # overridden in production

FASTAPI_ENV = os.environ.get("FASTAPI_ENV", "development")
TSURU_APPNAME = os.environ.get("TSURU_APPNAME", "")
FRONTEND_TSURU_APPNAME = os.environ.get("FRONTEND_TSURU_APPNAME", "")

CSRF_SECRET = os.environ.get("CSRF_SECRET", "secret")

TENANT_ID = os.environ.get("TENANT_ID")
APP_CLIENT_ID = os.environ.get("APP_CLIENT_ID")

DATABASE_USERNAME = os.environ.get("PGUSER")
DATABASE_PASSWORD = os.environ.get("PGPASSWORD")
DATABASE_HOST = os.environ.get("PGHOST")
DATABASE_PORT = os.environ.get("PGPORT")
DATABASE_NAME = os.environ.get("PGDATABASE")
