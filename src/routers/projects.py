from fastapi import APIRouter

router = APIRouter(prefix="/projects")


@router.get("/")
async def read_projects():
    return [{"title": "Rick"}, {"title": "Morty"}]


@router.get("/:id")
async def read_project(id: int):
    return {"title": "Rick"}
