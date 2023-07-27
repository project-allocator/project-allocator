import random
from typing import List
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session, select

from ..config import config
from ..dependencies import (
    check_admin,
    check_staff,
    check_student,
    get_session,
    get_user,
)
from ..models import Project, ProjectRead, Shortlist, User, UserRead

router = APIRouter(tags=["allocation"])


@router.post(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def allocate_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    for project in projects:
        shortlists = session.exec(
            select(Shortlist).where(Shortlist.project_id == project.id)
        ).all()
        project.allocatees = []
        project.allocatees = random.sample(
            list(map(lambda shortlist: shortlist.user, shortlists)),
            config["project"]["allocations"]["students"],
        )
        session.add(project)
        session.commit()
    return {"ok": True}


@router.delete(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def deallocate_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    for project in projects:
        project.allocatees = []
        session.add(project)
        session.commit()
    return {"ok": True}


@router.get(
    "/projects/{id}/allocatees",
    response_model=List[UserRead],
    dependencies=[Security(check_staff)],
)
async def read_allocatees(id: int, session: Session = Depends(get_session)):
    project = session.get(Project, id)
    print(project.allocatees)
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
