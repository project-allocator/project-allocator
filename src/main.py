from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Security, Depends
from fastapi_azure_auth.user import User
from sqlmodel import SQLModel

from .db import engine
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables if they do not exist on startup.
    # This does not recreate tables already present in the database.
    SQLModel.metadata.create_all(engine)
    # Load config for Open API
    await azure_scheme.openid_config.load_config()
    yield


app = FastAPI(
    lifespan=lifespan,
    **swagger_scheme,
)

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


@router.get("/test/guest")
async def test_guest():
    return {"ok": True}


@router.get("/test/auth")
async def test_auth(user: User = Depends(azure_scheme)):
    return {"ok": True, **user.dict()}


# Add this router after path operations
app.include_router(router)
