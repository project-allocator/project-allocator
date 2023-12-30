from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session

from ..dependencies import check_staff, get_session, get_user
from ..models import Project, ProjectRead, User

router = APIRouter(tags=["proposal"])


@router.get(
    "/users/me/proposed",
    response_model=list[ProjectRead],
    dependencies=[Security(check_staff)],
)
async def read_proposed_projects(user: Annotated[User, Depends(get_user)]):
    # Sort the projects so that the last updated project is returned first.
    proposed_projects = [proposal.proposed_project for proposal in user.proposals]
    proposed_projects.sort(key=lambda project: project.updated_at, reverse=True)

    return proposed_projects


@router.get(
    "/users/me/projects/{project_id}/proposed",
    response_model=bool,
    dependencies=[Security(check_staff)],
)
async def is_project_proposed(
    project_id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Need to check by id because SQLModel instances are not comparable by default.
    return project.proposal.proposer.id == user.id
