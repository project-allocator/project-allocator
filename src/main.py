from fastapi import APIRouter, FastAPI

from .routers import projects, users

app = FastAPI()

router = APIRouter(prefix="/api")
router.include_router(projects.router)
router.include_router(users.router)


@router.get("/")
async def root():
    return {"message": "Hello World"}


# Add this router after path operations
app.include_router(router)
