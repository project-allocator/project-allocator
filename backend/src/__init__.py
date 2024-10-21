import logging
import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request, Security
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette_csrf import CSRFMiddleware

from .auth import azure_scheme, swagger_scheme
from .env import CSRF_SECRET, FASTAPI_ENV, FRONTEND_TSURU_APPNAME, TSURU_APPNAME
from .logger import LoggerRoute
from .routers import (
    admins,
    allocations,
    configs,
    notifications,
    projects,
    proposals,
    shortlists,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load config for OpenAPI before launching FastAPI.
    await azure_scheme.openid_config.load_config()
    yield


def create_application() -> FastAPI:
    # Create FastAPI application with the authentication scheme for OpenAPI documentation.
    prod_url = f"https://{TSURU_APPNAME}.impaas.uk"
    server_url = (prod_url if FASTAPI_ENV == "production" else "/",)
    allowed_prod_origin = f"https://{FRONTEND_TSURU_APPNAME}.impaas.uk"
    allowed_origin = allowed_prod_origin if FASTAPI_ENV == "production" else "*"

    app = FastAPI(
        lifespan=lifespan,
        **swagger_scheme,
        servers=[
            {
                "url": server_url,
                "description": FASTAPI_ENV,
            }
        ],
    )
    app.add_middleware(CSRFMiddleware, secret=CSRF_SECRET)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[allowed_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Status router, not subjected to Azure Security
    status_router = APIRouter()

    @status_router.get("/alive")
    async def test_alive():
        return {"ok": True}

    app.include_router(status_router)

    # Main API router
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

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        # Log more information on 422 unprocessable entity error.
        # By default FastAPI does not produce detailed error message.
        logging.error(exc)
        return JSONResponse(
            content={"status_code": 422, "message": str(exc), "data": None},
            status_code=422,
        )

    # We must add this router after its endpoint have been configured.
    app.include_router(router)

    return app
