from typing import Annotated
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from ..dependencies import check_admin, check_staff, get_session, get_user
from ..models import Project, ProjectRead, User

router = APIRouter(tags=["proposal"])


@router.get(
    "/users/me/proposed",
    response_model=list[ProjectRead],
    dependencies=[Security(check_staff)],
)
async def read_proposed(user: Annotated[User, Depends(get_user)]):
    return [proposal.proposed_project for proposal in user.proposals]


@router.get(
    "/users/me/proposed/{project_id}",
    response_model=bool,
    dependencies=[Security(check_staff)],
)
async def is_proposed(
    project_id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    return project.proposal.proposer == user


@router.post(
    "/projects/{project_id}/approved",
    dependencies=[Security(check_admin)],
)
async def approve_proposal(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    project.approved = True
    session.add(project)
    session.commit()
    return {"ok": True}


@router.post(
    "/projects/{project_id}/reject",
    dependencies=[Security(check_admin)],
)
async def reject_proposal(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    project.approved = False
    session.add(project)
    session.commit()
    return {"ok": True}


@router.post(
    "/projects/{project_id}/undo",
    dependencies=[Security(check_admin)],
)
async def undo_proposal(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    project.approved = None
    session.add(project)
    session.commit()
    return {"ok": True}
