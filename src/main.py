from fastapi import APIRouter, FastAPI, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseSettings, Field
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer

from .routers import projects, users, proposals, shortlists


class Settings(BaseSettings):
    TENANT_ID: str = Field(default="", env="TENANT_ID")
    APP_CLIENT_ID: str = Field(default="", env="APP_CLIENT_ID")
    OPENAPI_CLIENT_ID: str = Field(default="", env="OPENAPI_CLIENT_ID")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()

app = FastAPI(
    # For Open API authentication
    swagger_ui_oauth2_redirect_url="/oauth2-redirect",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
        "clientId": settings.OPENAPI_CLIENT_ID,
    },
)

# For Open API authentication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For frontend authentiation
azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    tenant_id=settings.TENANT_ID,
    scopes={
        f"api://{settings.APP_CLIENT_ID}/user_impersonation": "user_impersonation",
    },
)

router = APIRouter(
    prefix="/api",
    # For generating frontend client
    generate_unique_id_function=lambda route: route.name,
)
router.include_router(projects.router)
router.include_router(users.router)
router.include_router(proposals.router)
router.include_router(shortlists.router)


# Load config for Open API
@app.on_event("startup")
async def load_config() -> None:
    await azure_scheme.openid_config.load_config()


@router.get("/")
async def root():
    return {"message": "Hello World"}


@router.get("/hello", dependencies=[Security(azure_scheme)])
async def test():
    return {"ok": True}


# Add this router after path operations
app.include_router(router)
