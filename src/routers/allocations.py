import random
from typing import List
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session, select

from ..config import config
from ..dependencies import (
    check_admin,
    check_staff,
    check_student,
    get_mail_send_token,
    get_session,
    get_user,
)
from ..models import Project, ProjectRead, Shortlist, User, UserRead
from ..utils import send_notifications

router = APIRouter(tags=["allocation"])


@router.post(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def allocate_projects(
    token: str | None = Depends(get_mail_send_token),
    session: Session = Depends(get_session),
):
    count = config["project"]["allocations"]["students"]
    projects = session.exec(select(Project)).all()
    # Allocate shortlisted students to projects
    for project in projects:
        shortlists = session.exec(
            select(Shortlist)
            .where(Shortlist.project_id == project.id)
            .order_by(Shortlist.preference.desc())
        ).all()
        shortlisters = list(map(lambda shortlist: shortlist.user, shortlists))
        project.allocatees = []
        project.allocatees = shortlisters[: min(count, len(shortlisters))]
        session.add(project)
        session.commit()
    # Allocate remaining students to projects
    for project in projects:
        # fmt: off
        non_allocatees = session.exec(
            select(User)
            .where(User.role == "student")
            .where(User.allocated == None)
        ).all()
        if len(project.allocatees) < count:
            project.allocatees += random.sample(
                non_allocatees,
                min(count - len(project.allocatees), len(non_allocatees)),
            )
            session.add(project)
            session.commit()
    send_notifications(
        title="Projects have been allocated.",
        description="You can check your allocated project in 'Allocated Project'.",
        roles=["staff", "admin"],
        token=token,
        session=session,
    )
    return {"ok": True}


@router.delete(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def deallocate_projects(
    token: str | None = Depends(get_mail_send_token),
    session: Session = Depends(get_session),
):
    projects = session.exec(select(Project)).all()
    for project in projects:
        project.allocatees = []
        session.add(project)
    session.commit()
    send_notifications(
        title="Projects have been deallocated.",
        description="Wait for the administrators to allocate projects again.",
        roles=["staff", "admin"],
        token=token,
        session=session,
    )
    return {"ok": True}


@router.get(
    "/projects/{id}/allocatees",
    response_model=List[UserRead],
    dependencies=[Security(check_staff)],
)
async def read_allocatees(id: int, session: Session = Depends(get_session)):
    project = session.get(Project, id)
    return project.allocatees


@router.get(
    "/users/me/allocated",
    response_model=ProjectRead | None,
    dependencies=[Security(check_student)],
)
async def read_allocated(user: User = Depends(get_user)):
    return user.allocated


@router.get(
    "/users/me/allocated/{id}",
    response_model=bool,
    dependencies=[Security(check_student)],
)
async def is_allocated(id: int, user: User = Depends(get_user)):
    return user.allocated is not None and user.allocated.id == id
