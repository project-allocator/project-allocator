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
async def allocate_projects(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    shortlists = session.exec(select(Shortlist)).all()

    # Allocate projects using the custom algorithm
    allocations_per_project = session.get(Config, "allocations_per_project")
    response = algorithms.allocate_projects(users, projects, shortlists, allocations_per_project)

    # Commit the changes made by the custom algorithm
    for user in users:
        session.add(user)
    for project in projects:
        session.add(project)
    for shortlist in shortlists:
        session.add(shortlist)

    session.commit()
    return response


@router.delete(
    "/projects/allocatees",
    dependencies=[Security(check_admin)],
)
async def deallocate_projects(session: Session = Depends(get_session)):
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
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
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
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
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
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
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
    project_id: int,
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    return [allocation.allocatee for allocation in project.allocations]


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
    project_id: int,
    users: list[UserRead],
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
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
    "/users/{user_id}/allocated",
    dependencies=[Security(check_admin)],
)
async def remove_allocatee(
    user_id: int,
    session: Session = Depends(get_session),
):
    allocation = session.get(Allocation, user_id)
    session.delete(allocation)
    session.commit()
    return {"ok": True}


@router.get(
    "/users/me/allocated",
    response_model=ProjectRead | None,
    dependencies=[Security(check_student)],
)
async def read_allocated(user: User = Depends(get_user)):
    return user.allocation.allocated_project


@router.get(
    "/users/me/allocated/{project_id}",
    response_model=bool,
    dependencies=[Security(check_student)],
)
async def is_allocated(
    project_id: int,
    user: User = Depends(get_user),
):
    return user.allocation is not None and user.allocation.allocated_project.id == project_id


@router.get(
    "/projects/conflicting",
    response_model=list[ProjectRead],
    dependencies=[Security(check_admin)],
)
async def read_conflicting_projects(session: Session = Depends(get_session)):
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
async def read_unallocated_users(session: Session = Depends(get_session)):
    query = select(User).where(and_(User.role == "student", User.allocated == None))
    return session.exec(query).all()
