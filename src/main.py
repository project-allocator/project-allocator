from fastapi import APIRouter, Security
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import azure_scheme, settings
from .routers import projects, users, proposals, shortlists, admin
from .auth import azure_scheme


# For Open API authentication
app = FastAPI(
    swagger_ui_oauth2_redirect_url="/oauth2-redirect",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True,
        "clientId": settings.OPENAPI_CLIENT_ID,
    },
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
router.include_router(admin.router)


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
