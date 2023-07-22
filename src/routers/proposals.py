from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..dependencies import get_session
from ..models import Project, ProjectReadWithDetails, User

router = APIRouter(tags=["proposal"])


@router.get("/users/me/proposed", response_model=List[ProjectReadWithDetails])
async def read_projects(session: Session = Depends(get_session)):
    # TODO: Read from session
    user_id = 1
    return session.exec(select(Project).where(Project.proposer_id == user_id)).all()
