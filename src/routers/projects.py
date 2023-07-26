from typing import List
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select

from ..models import (
    Project,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    User,
)
from ..dependencies import (
    block_proposals_if_shutdown,
    check_staff,
    get_session,
    get_user,
)

router = APIRouter(tags=["project"])


@router.get("/projects", response_model=List[ProjectRead])
async def read_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()


@router.get("/projects/{id}", response_model=ProjectRead)
async def read_project(id: int, session: Session = Depends(get_session)):
    return session.get(Project, id)


@router.post(
    "/projects",
    response_model=ProjectRead,
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def create_project(
    project_data: ProjectCreate,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = Project.from_orm(project_data)
    project.proposer = session.get(User, user.id)
    session.add(project)
    session.commit()
    return project


@router.put(
    "/projects/{id}",
    response_model=ProjectRead,
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def update_project(
    id: int,
    project_data: ProjectUpdate,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.proposer != user:
        raise HTTPException(status_code=401, detail="Project not owned by user")
    # Update project
    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(project, key, value)
    session.add(project)
    session.commit()
    return project


@router.delete(
    "/projects/{id}",
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def delete_project(
    id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.proposer != user:
        raise HTTPException(status_code=401, detail="Project not owned by user")
    session.delete(project)
    session.commit()
    return {"ok": True}
