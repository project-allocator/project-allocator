from fastapi import FastAPI, APIRouter, Security, Depends
from fastapi_azure_auth.user import User

from .auth import swagger_scheme, azure_scheme
from .routers import (
    projects,
    users,
    proposals,
    allocations,
    shortlists,
    admin,
    notifications,
)

# For Open API authentication
app = FastAPI(**swagger_scheme)


# Load config for Open API
@app.on_event("startup")
async def load_config() -> None:
    await azure_scheme.openid_config.load_config()


router = APIRouter(
    prefix="/api",
    # For generating frontend client
    generate_unique_id_function=lambda route: route.name,
    # Block if not authenticated
    dependencies=[Security(azure_scheme)],
)

# Order is important as path parameters may collide
router.include_router(allocations.router)
router.include_router(proposals.router)
router.include_router(shortlists.router)
router.include_router(admin.router)
router.include_router(projects.router)
router.include_router(users.router)
router.include_router(notifications.router)


@router.get("/")
async def root():
    return {"message": "Hello World"}


@router.get("/test")
async def test(user: User = Depends(azure_scheme)):
    return user.dict()


# Add this router after path operations
app.include_router(router)
