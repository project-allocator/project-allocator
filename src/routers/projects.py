from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..models import (
    Project,
    ProjectDetail,
    ProjectCreateWithDetails,
    ProjectReadWithDetails,
    ProjectReadWithDetails,
    ProjectUpdateWithDetails,
)
from ..dependencies import get_session
from ..config import config

router = APIRouter(prefix="/projects")


def check_project_detail(detail: ProjectDetail):
    # Check if detail is allowed in config
    if detail.key not in config["project"]["details"].keys():
        raise HTTPException(status_code=400, detail="Invalid project details")


@router.get("/", response_model=List[ProjectReadWithDetails])
async def read_projects(session: Session = Depends(get_session)):
    return session.exec(select(Project)).all()


@router.get("/{id}", response_model=ProjectReadWithDetails)
async def read_project(id: int, session: Session = Depends(get_session)):
    return session.get(Project, id)


@router.post("/", response_model=ProjectReadWithDetails)
async def create_project(
    project_data: ProjectCreateWithDetails,
    session: Session = Depends(get_session),
):
    # Create project
    project = Project.from_orm(project_data)
    session.add()
    # Create project details
    for detail_data in project_data.details:
        check_project_detail(detail_data)
        detail = ProjectDetail.from_orm(detail_data)
        detail.project = project
        session.add(detail)
    session.commit()
    return project


@router.put("/{id}", response_model=ProjectReadWithDetails)
async def update_project(
    id: int,
    project_data: ProjectUpdateWithDetails,
    session: Session = Depends(get_session),
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Update project
    for key, value in project_data.dict(
        exclude_unset=True,
        exclude=["details"],
    ).items():
        setattr(project, key, value)
    # Update project details
    for detail_data in project_data.details:
        check_project_detail(detail_data)
        # Find the matching project detail
        # or create a new one if not present
        detail = next(
            filter(lambda detail: detail.key == detail_data.key, project.details),
            ProjectDetail.from_orm(detail_data),
        )
        detail.value = detail_data.value
        session.add(detail)
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
