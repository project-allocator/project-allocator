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
