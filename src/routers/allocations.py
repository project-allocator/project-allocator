from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session, select
from operator import and_

from .. import algorithms
from ..dependencies import (
    block_undos_if_shutdown,
    check_admin,
    check_staff,
    check_student,
    get_session,
    get_user,
)
from ..models import (
    User,
    UserRead,
    Project,
    ProjectRead,
    Allocation,
    Shortlist,
    Config,
)

router = APIRouter(tags=["allocation"])


@router.post(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def allocate_projects(session: Annotated[Session, Depends(get_session)]):
    students = session.exec(select(User).where(User.role == "student")).all()
    projects = session.exec(select(Project)).all()
    shortlists = session.exec(select(Shortlist)).all()

    # Allocate projects using the custom algorithm
    max_allocations = session.get(Config, "max_allocations")
    max_allocations = int(max_allocations.value)
    allocations = algorithms.allocate_projects(students, projects, shortlists, max_allocations)

    # Commit the changes made by the custom algorithm
    session.add_all(allocations)
    session.commit()
    return {"ok": True}


@router.delete(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def deallocate_projects(session: Annotated[Session, Depends(get_session)]):
    allocations = session.exec(select(Allocation)).all()
    for allocation in allocations:
        session.delete(allocation)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocated/accepted",
    dependencies=[Security(check_student)],
)
async def accept_allocation(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    user.allocation.accepted = True
    session.add(user)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocated/declined",
    dependencies=[Security(check_student)],
)
async def decline_allocation(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    user.allocation.accepted = False
    session.add(user)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocated/undo",
    dependencies=[Security(check_student), Security(block_undos_if_shutdown)],
)
async def undo_allocation(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    user.allocation.accepted = None
    session.add(user)
    session.commit()
    return {"ok": True}


@router.get(
    "/projects/{project_id}/allocatees",
    response_model=list[UserRead],
    dependencies=[Security(check_staff)],
)
async def read_allocatees(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # TODO:
    # This is a temporary hack which needs to be fixed.
    allocatees = [allocation.allocatee for allocation in project.allocations]
    for allocatee in allocatees:
        allocatee.accepted = allocatee.allocation.accepted
    return allocatees


@router.get(
    "/users/me/allocated/accepted",
    response_model=bool | None,
    dependencies=[Security(check_student)],
)
async def is_accepted(user: User = Depends(get_user)):
    return user.allocation.accepted


@router.post(
    "/projects/{project_id}/allocatees",
    dependencies=[Security(check_admin)],
)
async def add_allocatees(
    project_id: str,
    users: list[UserRead],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.approved:
        # Cannot add students to non approved projects
        raise HTTPException(status_code=404, detail="Project not approved")

    for user in users:
        user = session.get(User, user.id)
        if user.role != "student":
            raise HTTPException(status_code=404, detail="User not a student")

        allocation = Allocation(allocatee=user, allocated_project=project)
        session.add(allocation)

    session.commit()
    return {"ok": True}


@router.delete(
    "/projects/{project_id}/allocatees/{user_id}",
    dependencies=[Security(check_admin)],
)
async def remove_allocatee(
    project_id: str,
    user_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    allocation = session.get(Allocation, user_id)
    if not allocation or allocation.allocated_project.id != project_id:
        raise HTTPException(status_code=404, detail="User not allocated to project")

    session.delete(allocation)
    session.commit()
    return {"ok": True}


@router.get(
    "/users/me/allocated",
    response_model=ProjectRead | None,
    dependencies=[Security(check_student)],
)
async def read_allocated(user: Annotated[User, Depends(get_user)]):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")

    return user.allocation.allocated_project


@router.get(
    "/users/me/allocated/{project_id}",
    response_model=bool,
    dependencies=[Security(check_student)],
)
async def is_allocated(
    project_id: str,
    user: Annotated[User, Depends(get_user)],
):
    return user.allocation and user.allocation.allocated_project.id == project_id


@router.get(
    "/projects/conflicting",
    response_model=list[ProjectRead],
    dependencies=[Security(check_admin)],
)
async def read_conflicting_projects(session: Annotated[Session, Depends(get_session)]):
    # Only show approved projects.
    # 'Project.approved == True' does seem to be redundant
    # but is required by SQLModel to construct a valid query.
    query = select(Project).where(Project.approved == True)
    projects = session.exec(query).all()
    return [project for project in projects if not all([allocation.accepted for allocation in project.allocations])]


@router.get(
    "/users/unallocated",
    response_model=list[UserRead],
    dependencies=[Security(check_admin)],
)
async def read_unallocated_users(session: Annotated[Session, Depends(get_session)]):
    query = select(User).where(and_(User.role == "student", User.allocation == None))
    return session.exec(query).all()
