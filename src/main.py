from fastapi import APIRouter, FastAPI

from .routers import projects, users, proposals, shortlists

app = FastAPI()

router = APIRouter(prefix="/api")
router.include_router(projects.router)
router.include_router(users.router)
router.include_router(proposals.router)
router.include_router(shortlists.router)


@router.get("/")
async def root():
    return {"message": "Hello World"}


# Add this router after path operations
app.include_router(router)
