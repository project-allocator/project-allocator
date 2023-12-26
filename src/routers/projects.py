from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select
from operator import or_
import json


from ..dependencies import (
    block_proposals_if_shutdown,
    check_admin,
    check_staff,
    get_session,
    get_user,
)
from ..models import (
    User,
    Project,
    ProjectDetail,
    ProjectDetailTemplate,
    ProjectDetailTemplateRead,
    ProjectReadWithDetails,
    ProjectDetailCreate,
    ProjectDetailUpdate,
    ProjectCreateWithDetails,
    ProjectUpdateWithDetails,
    Proposal,
)

router = APIRouter(tags=["project"])


def serialize_project_details(details: list[ProjectDetailCreate | ProjectDetailUpdate]):
    for detail in details:
        match detail.type:
            case "number" | "slider":
                detail.value = str(detail.value)
            case "switch":
                detail.value = "true" if detail.value else "false"
            case "checkbox" | "categories":
                detail.value = json.dumps(detail.value)


def parse_project_details(details: list[ProjectDetail]):
    for detail in details:
        match detail.type:
            case "number" | "slider":
                detail.value = int(detail.value)
            case "switch":
                detail.value = detail.value == "true"
            case "checkbox" | "categories":
                detail.value = json.loads(detail.value)


@router.get(
    "/projects/approved",
    response_model=list[ProjectReadWithDetails],
)
async def read_approved_projects(session: Annotated[Session, Depends(get_session)]):
    # Only show projects approved by admins.
    query = select(Project).where(Project.approved == True)
    projects = session.exec(query).all()

    # Sort the projects so that the last updated project is returned first.
    projects.sort(key=lambda project: project.updated_at, reverse=True)

    for project in projects:
        parse_project_details(project.details)
    return projects


@router.get(
    "/projects/non-approved",
    response_model=list[ProjectReadWithDetails],
    dependencies=[Security(check_admin)],
)
async def read_non_approved_projects(session: Annotated[Session, Depends(get_session)]):
    query = select(Project).where(or_(Project.approved == False, Project.approved == None))
    projects = session.exec(query).all()

    for project in projects:
        parse_project_details(project.details)
    return projects


@router.get(
    "/projects/{project_id}",
    response_model=ProjectReadWithDetails,
)
async def read_project(
    project_id: str,
    session: Session = Depends(get_session),
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    parse_project_details(project.details)
    return project


@router.post(
    "/projects",
    response_model=ProjectReadWithDetails,
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def create_project(
    project_data: ProjectCreateWithDetails,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    # Prevent staff from approving their own projects.
    project_data.approved = None

    # Check if the key and type are consistent with the template before commit.
    templates = session.exec(select(ProjectDetailTemplate)).all()
    for detail in project_data.details:
        template = next((template for template in templates if template.key == detail.key), None)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid project detail key")
        if template.type != detail.type:
            raise HTTPException(status_code=400, detail="Invalid project detail type")

    # Remove project details in order to validate the project.
    project_data_details = project_data.details
    del project_data.details
    project = Project.model_validate(project_data)

    # Serialize and validate project details.
    serialize_project_details(project_data_details)
    project_details = [ProjectDetail.model_validate(detail) for detail in project_data_details]
    project.details = project_details

    # Create corresponding project proposal.
    proposal = Proposal(proposer=user, proposed_project=project)

    session.add(project)
    session.add_all(project_details)
    session.add(proposal)
    session.commit()

    parse_project_details(project.details)
    return project


@router.put(
    "/projects/{project_id}",
    response_model=ProjectReadWithDetails,
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def update_project(
    project_id: str,
    project_data: ProjectUpdateWithDetails,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.proposal or project.proposal.proposer != user:
        # Only project proposer can edit the project.
        raise HTTPException(status_code=401, detail="Project not proposed by user")

    # Prevent staff from approving their own projects.
    project_data.approved = None

    # Check if the key and type are consistent with the template before commit.
    templates = session.exec(select(ProjectDetailTemplate)).all()
    for detail in project_data.details:
        template = next((template for template in templates if template.key == detail.key), None)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid project detail key")
        if template.type != detail.type:
            raise HTTPException(status_code=400, detail="Invalid project detail type")

    # Exclude unset fields to perform partial update.
    for key, value in project_data.model_dump(exclude_unset=True, exclude=["details"]).items():
        setattr(project, key, value)

    # Serialize and update the values of corresponding project details.
    serialize_project_details(project_data.details)
    project_details = []
    for project_data_detail in project_data.details:
        project_detail = session.get(ProjectDetail, (project_data_detail.key, project_id))
        project_detail.value = project_data_detail.value
        project_details.append(project_detail)

    session.add(project)
    session.add_all(project_details)
    session.commit()

    parse_project_details(project.details)
    return project


@router.delete(
    "/projects/{project_id}",
    dependencies=[Security(check_staff), Security(block_proposals_if_shutdown)],
)
async def delete_project(
    project_id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.proposal or project.proposal.proposer != user:
        raise HTTPException(status_code=401, detail="Project not proposed by user")

    # We use cascade delete to make sure that
    # the project's details, proposals, allocations and shortlists are also deleted.
    session.delete(project)
    session.commit()
    return {"ok": True}


@router.get(
    "/projects/details/templates",
    response_model=list[ProjectDetailTemplateRead],
)
async def read_project_detail_templates(session: Session = Depends(get_session)):
    return session.exec(select(ProjectDetailTemplate)).all()
