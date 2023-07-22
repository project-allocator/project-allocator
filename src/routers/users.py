from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..models import User, UserRead
from ..dependencies import get_session

router = APIRouter(tags=["user"])


@router.get("/users/me", response_model=UserRead)
async def read_current_user(session: Session = Depends(get_session)):
    # TODO: Read from session
    user_id = 1
    return session.get(User, user_id)


@router.get("/users/{id}", response_model=UserRead)
async def read_user(id: int, session: Session = Depends(get_session)):
    return session.get(User, id)
