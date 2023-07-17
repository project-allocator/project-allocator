from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..models import User, UserRead
from ..dependencies import get_session

router = APIRouter(prefix="/users")


@router.get("/{id}", response_model=UserRead)
async def read_user(id: int, session: Session = Depends(get_session)):
    return session.get(User, id)
