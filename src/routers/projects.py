from typing import TypeAlias
from fastapi import APIRouter, Depends, HTTPException, Security
from operator import or_
from sqlmodel import Session, select
import json

from src.models.project import ProjectDetail


from ..models import (
    Project,
    ProjectCreateWithDetails,
    ProjectReadWithDetails,
    ProjectUpdateWithDetails,
    Proposal,
    User,
)
from ..dependencies import (
    block_proposals_if_shutdown,
    check_admin,
    check_staff,
    get_session,
    get_user,
)

router = APIRouter(tags=["project"])


class ProjectDetailValidator:
    ProjectDataWithDetails: TypeAlias = ProjectCreateWithDetails | ProjectUpdateWithDetails

    @staticmethod
    def serialize(project: ProjectDataWithDetails) -> ProjectDataWithDetails:
        project = project.model_copy(deep=True)
        for detail in project.details:
            match detail.type:
                case "number" | "slider":
                    detail.value = str(detail.value)
                case "switch":
                    detail.value = "true" if detail.value else "false"
                case "checkbox" | "categories":
                    detail.value = json.dumps(detail.value)
        return project

    @staticmethod
    def parse(project: Project) -> ProjectReadWithDetails:
        project = ProjectReadWithDetails.model_validate(project)
        for detail in project.details:
            match detail.type:
                case "number" | "slider":
                    detail.value = int(detail.value)
                case "switch":
                    detail.value = detail.value == "true"
                case "checkbox" | "categories":
                    detail.value = json.loads(detail.value)
        return project


@router.get(
    "/projects/approved",
    response_model=list[ProjectReadWithDetails],
)
async def read_approved_projects(session: Session = Depends(get_session)):
    # Only show projects approved by admins.
    # Note: 'Project.approved == True' is necessary.
    # This is used by SQLModel to construct a valid query, so do not replace it with 'Project.approved'
    query = select(Project).where(Project.approved == True)
    projects = session.exec(query).all()

    # Sort the projects so that the last updated project is returned first.
    projects.sort(key=lambda project: project.updated_at, reverse=True)

    return list(map(ProjectDetailValidator.parse, projects))


@router.get(
    "/projects/non-approved",
    response_model=list[ProjectReadWithDetails],
    dependencies=[Security(check_admin)],
)
async def read_non_approved_projects(session: Session = Depends(get_session)):
    query = select(Project).where(or_(Project.approved == False, Project.approved == None))
    projects = session.exec(query).all()

    return list(map(ProjectDetailValidator.parse, projects))


@router.get(
    "/projects/{project_id}",
    response_model=ProjectReadWithDetails,
)
async def read_project(
    project_id: int,
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectDetailValidator.parse(project)


@router.post(
    "/projects",
    response_model=ProjectReadWithDetails,
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def create_project(
    project_data: ProjectCreateWithDetails,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project_data = ProjectDetailValidator.serialize(project_data)

    # Exclude details to prevent error while parsing project.
    project_data_details = project_data.details
    del project_data.details
    project = Project.model_validate(project_data)

    project_details = []
    for project_data_detail in project_data_details:
        project_detail = ProjectDetail.model_validate(project_data_detail)
        project_details.append(project_detail)
    project.details = project_details

    proposal = Proposal(proposer=user, proposed_project=project)
    project.proposal = proposal

    session.add(project)
    session.add(proposal)
    session.commit()

    return ProjectDetailValidator.parse(project)


@router.put(
    "/projects/{project_id}",
    response_model=ProjectReadWithDetails,
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def update_project(
    project_id: int,
    project_data: ProjectUpdateWithDetails,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.proposal.proposer != user:
        # Only project proposer can edit the project.
        raise HTTPException(status_code=401, detail="Project not proposed by user")

    project_data = ProjectDetailValidator.serialize(project_data)
    # Update each property of the project.
    for key, value in project_data.model_dump(exclude_unset=True, exclude=["details"]).items():
        setattr(project, key, value)
    # Update each property of the project details.
    for project_data_detail in project_data.details:
        for project_detail in project.details:
            if project_detail.key == project_data_detail.key:
                project_detail.value = project_data_detail.value

    session.add(project)
    session.commit()
    return ProjectDetailValidator.parse(project)


@router.delete(
    "/projects/{project_id}",
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def delete_project(
    project_id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.proposal.proposer != user:
        raise HTTPException(status_code=401, detail="Project not proposed by user")

    session.delete(project)
    session.commit()
    return {"ok": True}
