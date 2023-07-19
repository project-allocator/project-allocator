from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..models import User, UserRead
from ..dependencies import get_session

router = APIRouter(prefix="/users", tags=["user"])


@router.get("/{id}", response_model=UserRead)
async def read_user(id: int, session: Session = Depends(get_session)):
    return session.get(User, id)
