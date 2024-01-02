from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session

from ..dependencies import (
    check_staff,
    get_session,
    get_user,
)
from ..models import (
    Project,
    ProjectRead,
    User,
    UserRead,
)
from ..logger import LoggerRoute

router = APIRouter(tags=["proposal"], route_class=LoggerRoute)


@router.get(
    "/users/me/proposed_projects",
    response_model=list[ProjectRead],
    dependencies=[Security(check_staff)],
)
async def read_proposed_projects(
    user: Annotated[User, Depends(get_user)],
):
    # Sort the projects so that the last updated project is returned first.
    proposed_projects = [proposal.proposed_project for proposal in user.proposals]
    proposed_projects.sort(key=lambda project: project.updated_at, reverse=True)

    return proposed_projects


@router.get(
    "/projects/{project_id}/proposer",
    response_model=UserRead,
)
async def read_proposer(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project.proposal.proposer
