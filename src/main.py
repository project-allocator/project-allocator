import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request, Security, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi_azure_auth.user import User
from sqlmodel import SQLModel

from .db import engine
from .config import config
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


# Create FastAPI application with the authentication scheme
# for Swagger API documentation.
app = FastAPI(
    lifespan=lifespan,
    **swagger_scheme,
)

router = APIRouter(
    prefix="/api",
    # For generating frontend client
    generate_unique_id_function=lambda route: route.name,
    # Set the authentication scheme for the entire API.
    # Uses AzureAD to authenticate users.
    dependencies=[Security(azure_scheme)],
)

# This order is important as path parameters may have collisions
# e.g. /users/me and /users/{user_id}
router.include_router(allocations.router)
router.include_router(proposals.router)
router.include_router(shortlists.router)
router.include_router(admin.router)
router.include_router(projects.router)
router.include_router(users.router)
router.include_router(notifications.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log more information on 422 unprocessable entity error.
    # By default FastAPI does not produce detailed error message.
    logging.error(exc)
    return JSONResponse(
        content={"status_code": 422, "message": str(exc), "data": None},
        status_code=422,
    )


@router.get("/config")
async def read_config():
    # Make the config object loaded from `config.yaml` accessible to the frontend.
    # This endpoint allows us to store config in a single location.
    return config


@router.get("/test/guest")
async def test_guest():
    return {"ok": True}


@router.get("/test/auth")
async def test_auth(user: User = Depends(azure_scheme)):
    return {"ok": True, **user.dict()}


# Add this router after path operations
app.include_router(router)
