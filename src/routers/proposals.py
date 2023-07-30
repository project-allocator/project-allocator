from typing import List
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session, select

from ..dependencies import check_staff, get_session, get_user
from ..models import Project, ProjectRead, User

router = APIRouter(tags=["proposal"])


@router.get(
    "/users/me/proposed",
    response_model=List[ProjectRead],
    dependencies=[Security(check_staff)],
)
async def read_proposed(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    return session.exec(select(Project).where(Project.proposer_id == user.id)).all()


@router.get(
    "/users/me/proposed/{project_id}",
    response_model=bool,
    dependencies=[Security(check_staff)],
)
async def is_proposed(
    project_id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    return project.proposer == user
