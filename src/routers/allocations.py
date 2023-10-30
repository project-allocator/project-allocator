from typing import List
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select

from .. import algorithms
from ..dependencies import (
    block_undos_if_shutdown,
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
    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    shortlists = session.exec(select(Shortlist)).all()
    # Allocate projects using the custom algorithm
    res = algorithms.allocate_projects(users, projects, shortlists)
    # Reflect changes to the models made by the custom algorithm
    for entity in users + projects + shortlists:
        session.add(entity)
    session.commit()
    return res


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
    students = session.exec(select(User).where(User.role == "student")).all()
    for student in students:
        student.accepted = None
        session.add(student)
        session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocated/accepted",
    dependencies=[Security(check_student)],
)
async def accept_allocation(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    user.accepted = True
    session.add(user)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocated/declined",
    dependencies=[Security(check_student)],
)
async def decline_allocation(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    user.accepted = False
    session.add(user)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocated/undo",
    dependencies=[Security(check_student), Security(block_undos_if_shutdown)],
)
async def undo_allocation(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    user.accepted = None
    session.add(user)
    session.commit()
    return {"ok": True}


@router.get(
    "/projects/{project_id}/allocatees",
    response_model=List[UserRead],
    dependencies=[Security(check_staff)],
)
async def read_allocatees(
    project_id: int,
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    return project.allocatees


@router.get(
    "/users/me/allocated/accepted",
    response_model=bool | None,
    dependencies=[Security(check_student)],
)
async def is_accepted(user: User = Depends(get_user)):
    return user.accepted


@router.post(
    "/projects/{project_id}/allocatees",
    dependencies=[Security(check_admin)],
)
async def add_allocatees(
    project_id: int,
    users: List[UserRead],
    session: Session = Depends(get_session),
):
    # Cannot add students to non approved projects
    project = session.get(Project, project_id)
    if not project.approved:
        raise HTTPException(status_code=404, detail="Project not approved")
    for user in users:
        user = session.get(User, user.id)
        user.allocated = project
        user.accepted = None
        session.add(project)
        session.commit()
    return {"ok": True}


@router.delete(
    "/users/{user_id}/allocated",
    dependencies=[Security(check_admin)],
)
async def remove_allocatee(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    user.allocated = None
    user.accepted = None
    session.add(user)
    session.commit()
    return {"ok": True}


@router.get(
    "/users/me/allocated",
    response_model=ProjectRead | None,
    dependencies=[Security(check_student)],
)
async def read_allocated(user: User = Depends(get_user)):
    return user.allocated


@router.get(
    "/users/me/allocated/{project_id}",
    response_model=bool,
    dependencies=[Security(check_student)],
)
async def is_allocated(
    project_id: int,
    user: User = Depends(get_user),
):
    return user.allocated is not None and user.allocated.id == project_id


@router.get(
    "/projects/conflicting",
    response_model=List[ProjectRead],
    dependencies=[Security(check_admin)],
)
async def read_conflicting_projects(session: Session = Depends(get_session)):
    # Only show approved projects.
    # 'Project.approved == True' does seem to be redundant
    # but is required by SQLModel to construct a valid query.
    projects = session.exec(select(Project).where(Project.approved == True)).all()
    conflicting = []
    for project in projects:
        # fmt: off
        resolved = any(list(map(lambda allocatee: allocatee.accepted, project.allocatees)))
        if not resolved:
            conflicting.append(project)
    return conflicting


@router.get(
    "/users/unallocated",
    response_model=List[UserRead],
    dependencies=[Security(check_admin)],
)
async def read_unallocated_users(session: Session = Depends(get_session)):
    unallocated = session.exec(select(User).where(User.allocated == None)).all()
    return unallocated
