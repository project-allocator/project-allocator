from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..dependencies import get_session
from ..models import Config, ConfigRead

router = APIRouter(tags=["config"])


@router.get(
    "/configs",
    response_model=list[ConfigRead],
)
async def read_configs(session: Annotated[Session, Depends(get_session)]):
    return session.exec(select(Config)).all()
