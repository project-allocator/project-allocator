from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..models import Project, ProjectCreate, ProjectRead, ProjectUpdate
from ..dependencies import get_session

router = APIRouter(prefix="/projects")


@router.get("/", response_model=List[ProjectRead])
async def read_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()


@router.get("/{id}", response_model=ProjectRead)
async def read_project(id: int, session: Session = Depends(get_session)):
    return session.get(Project, id)


@router.post("/", response_model=ProjectRead)
async def create_project(
    project: ProjectCreate, session: Session = Depends(get_session)
):
    project = Project.from_orm(project)
    session.add(project)
    session.commit()
    return project


@router.put("/{id}", response_model=ProjectRead)
async def update_project(
    id: int, project: ProjectUpdate, session: Session = Depends(get_session)
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project.dict(exclude_unset=True).items():
        setattr(project, key, value)
    session.add(project)
    session.commit()
    return project


@router.delete("/{id}")
async def delete_project(session: Session = Depends(get_session)):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"ok": True}
