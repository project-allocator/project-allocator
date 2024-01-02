from fastapi import FastAPI, APIRouter, Security
from starlette_csrf import CSRFMiddleware
from contextlib import asynccontextmanager

from .routers import (
    admins,
    users,
    projects,
    proposals,
    allocations,
    shortlists,
    notifications,
    configs,
)
from .auth import swagger_scheme, azure_scheme
from .logger import LoggerRoute


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load config for OpenAPI before launching FastAPI.
    await azure_scheme.openid_config.load_config()
    yield


# Create FastAPI application with the authentication scheme for OpenAPI documentation.
app = FastAPI(
    lifespan=lifespan,
    **swagger_scheme,
)
# TODO: Read secret from environment variable.
app.add_middleware(CSRFMiddleware, secret="secret")

router = APIRouter(
    prefix="/api",
    # For generating frontend client
    generate_unique_id_function=lambda route: route.name,
    # Set the authentication scheme for the entire API.
    # Uses AzureAD to authenticate users.
    dependencies=[Security(azure_scheme)],
    route_class=LoggerRoute,
)

# This order is important as path parameters may have collisions
# e.g. /users/me and /users/{user_id}
router.include_router(allocations.router)
router.include_router(proposals.router)
router.include_router(shortlists.router)
router.include_router(admins.router)
router.include_router(projects.router)
router.include_router(users.router)
router.include_router(notifications.router)
router.include_router(configs.router)


@router.get("/test/alive")
async def test_alive():
    return {"ok": True}


# We must add this router after its endpoint have been configured.
app.include_router(router)
