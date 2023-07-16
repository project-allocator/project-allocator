from fastapi import APIRouter

router = APIRouter(prefix="/users")


@router.get("/")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.get("/:id")
async def read_user(id: int):
    return {"username": "Rick"}
