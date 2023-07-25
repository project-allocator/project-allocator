from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    TENANT_ID: str = Field(default="", env="TENANT_ID")
    APP_CLIENT_ID: str = Field(default="", env="APP_CLIENT_ID")
    OPENAPI_CLIENT_ID: str = Field(default="", env="OPENAPI_CLIENT_ID")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()

azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    tenant_id=settings.TENANT_ID,
    scopes={
        f"api://{settings.APP_CLIENT_ID}/user_impersonation": "user_impersonation",
    },
)
