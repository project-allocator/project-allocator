from typing import Annotated, Optional
from fastapi import APIRouter, HTTPException, Depends, Security, Body
from sqlmodel import Session, select

from .. import algorithms
from ..dependencies import (
    block_on_resets_shutdown,
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
    "/users/me/allocated/status",
    dependencies=[Security(check_student), Security(block_on_resets_shutdown)],
)
async def set_allocation_status(
    user: Annotated[User, Depends(get_user)],
    accepted: Annotated[bool, Body(embed=True)],  # embed=True for clarity of generated API client
    session: Annotated[Session, Depends(get_session)],
):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")
    if user.allocation.accepted is not None:
        raise HTTPException(status_code=400, detail="User already accepted or rejected allocation")

    user.allocation.accepted = accepted
    session.add(user)
    session.commit()
    return {"ok": True}


@router.delete(
    "/users/me/allocated/status",
    dependencies=[Security(check_student), Security(block_on_resets_shutdown)],
)
async def reset_allocation_status(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")
    if user.allocation.accepted is None:
        raise HTTPException(status_code=400, detail="User has not accepted or rejected allocation")

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

    allocatees = []
    for allocation in project.allocations:
        allocatee = UserRead.model_validate(allocation.allocatee)
        allocatee.accepted = allocation.accepted
        allocatees.append(allocatee)
    return allocatees


@router.post(
    "/projects/{project_id}/allocatees",
    dependencies=[Security(check_admin)],
)
async def add_allocatees(
    project_id: str,
    user_ids: list[str],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.approved:
        # Cannot add students to non approved projects
        raise HTTPException(status_code=404, detail="Project not approved")

    for user_id in user_ids:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
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
    response_model=ProjectRead,
    dependencies=[Security(check_student)],
)
async def read_allocated_project(user: Annotated[User, Depends(get_user)]):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")

    return user.allocation.allocated_project
