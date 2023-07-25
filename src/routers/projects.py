from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..models import (
    Project,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    User,
)
from ..dependencies import block_proposals_if_shutdown, get_session

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
    dependencies=[Depends(block_proposals_if_shutdown)],
)
async def create_project(
    project_data: ProjectCreate,
    session: Session = Depends(get_session),
):
    project = Project.from_orm(project_data)
    # TODO: Read from session
    user_id = 1
    project.proposer = session.get(User, user_id)
    session.add(project)
    session.commit()
    return project


@router.put(
    "/projects/{id}",
    response_model=ProjectRead,
    dependencies=[Depends(block_proposals_if_shutdown)],
)
async def update_project(
    id: int,
    project_data: ProjectUpdate,
    session: Session = Depends(get_session),
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Update project
    for key, value in project_data.dict(exclude_unset=True).items():
        setattr(project, key, value)
    session.add(project)
    session.commit()
    return project


@router.delete(
    "/projects/{id}",
    dependencies=[Depends(block_proposals_if_shutdown)],
)
async def delete_project(id: int, session: Session = Depends(get_session)):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"ok": True}
