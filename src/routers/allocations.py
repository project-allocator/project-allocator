from operator import and_
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session, select


from .. import algorithms
from ..dependencies import (
    check_admin,
    check_staff,
    check_student,
    get_session,
    get_user,
)
from ..models import (
    User,
    UserRead,
    UserReadWithAllocation,
    Project,
    ProjectReadWithAllocations,
    Allocation,
    Shortlist,
    Config,
)
from ..logger import LoggerRoute


router = APIRouter(tags=["allocation"], route_class=LoggerRoute)


@router.get(
    "/users/me/allocated_project",
    response_model=ProjectReadWithAllocations,
    dependencies=[Security(check_student)],
)
async def read_allocated_project(user: Annotated[User, Depends(get_user)]):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")

    allocated_project = user.allocation.allocated_project
    allocated_project.allocations = [user.allocation]  # student can only see their own allocation
    return allocated_project


@router.get(
    "/projects/{project_id}/allocatees",
    response_model=list[UserReadWithAllocation],
    dependencies=[Security(check_staff)],
)
async def read_allocatees(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return [allocation.allocatee for allocation in project.allocations]


@router.get(
    "/projects/non-allocatees",
    response_model=list[UserRead],
    dependencies=[Security(check_admin)],
)
async def read_non_allocatees(session: Annotated[Session, Depends(get_session)]):
    query = select(User).where(and_(User.role == "student", User.allocation == None))
    return session.exec(query).all()


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


@router.post(
    "/projects/allocate",
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


@router.post(
    "/projects/deallocate",
    dependencies=[Security(check_admin)],
)
async def deallocate_projects(session: Annotated[Session, Depends(get_session)]):
    allocations = session.exec(select(Allocation)).all()
    for allocation in allocations:
        session.delete(allocation)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocation/accept",
    dependencies=[Security(check_student)],
)
async def accept_allocation(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")
    if user.allocation.locked:
        raise HTTPException(status_code=403, detail="Allocation locked")

    user.allocation.accepted = True
    session.add(user)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/allocation/reject",
    dependencies=[Security(check_student)],
)
async def reject_allocation(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    if not user.allocation:
        raise HTTPException(status_code=404, detail="User not allocated to project")
    if user.allocation.locked:
        raise HTTPException(status_code=403, detail="Allocation locked")

    user.allocation.accepted = False
    session.add(user)
    session.commit()
    return {"ok": True}


@router.post(
    "/allocations/lock",
    dependencies=[Security(check_admin)],
)
async def lock_allocations(
    session: Annotated[Session, Depends(get_session)],
):
    allocations = session.exec(select(Allocation)).all()
    for allocation in allocations:
        allocation.locked = True
        session.add(allocation)
    session.commit()
    return {"ok": True}


@router.post(
    "/allocations/unlock",
    dependencies=[Security(check_admin)],
)
async def unlock_allocations(
    session: Annotated[Session, Depends(get_session)],
):
    allocations = session.exec(select(Allocation)).all()
    for allocation in allocations:
        allocation.locked = False
        session.add(allocation)
    session.commit()
    return {"ok": True}
