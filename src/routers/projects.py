from operator import or_
from typing import Annotated
from fastapi import APIRouter, Body, Depends, HTTPException, Security
from sqlmodel import Session, select
import json


from ..dependencies import (
    block_on_proposals_shutdown,
    check_admin,
    check_staff,
    check_student,
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


def serialize_project_detail(type: str, detail: ProjectDetailCreate | ProjectDetailUpdate):
    match type:
        case "number" | "slider":
            detail.value = str(detail.value)
        case "switch":
            detail.value = "true" if detail.value else "false"
        case "checkbox" | "categories":
            detail.value = json.dumps(detail.value)


def parse_project_detail(detail: ProjectDetail):
    match detail.template.type:
        case "number" | "slider":
            detail.value = int(detail.value)
        case "switch":
            detail.value = detail.value == "true"
        case "checkbox" | "categories":
            detail.value = json.loads(detail.value)


@router.get(
    "/projects/details/templates",
    response_model=list[ProjectDetailTemplateRead],
)
async def read_project_detail_templates(session: Session = Depends(get_session)):
    # Sort the templates so that the details are displayed in order of creation.
    templates = session.exec(select(ProjectDetailTemplate)).all()
    templates.sort(key=lambda template: template.created_at)

    return templates


@router.get(
    "/projects",
    response_model=list[ProjectReadWithDetails],
)
async def read_projects(
    *,  # prevent default parameter ordering error
    approved: bool = True,
    session: Annotated[Session, Depends(get_session)],
):
    if approved:
        # Only show projects approved by admins.
        query = select(Project).where(Project.approved == True)
    else:
        # Only show projects disapproved or not approved by admins.
        query = select(Project).where(or_(Project.approved == False, Project.approved == None))

    # Sort the projects so that the last updated project is returned first.
    projects = session.exec(query).all()
    projects.sort(key=lambda project: project.updated_at, reverse=True)

    for project in projects:
        for detail in project.details:
            parse_project_detail(detail)
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

    # TODO: Model validate before return?
    for detail in project.details:
        parse_project_detail(detail)
    return project


@router.post(
    "/projects",
    response_model=ProjectReadWithDetails,
    dependencies=[Security(check_staff), Security(block_on_proposals_shutdown)],
)
async def create_project(
    project_data: ProjectCreateWithDetails,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    # Prevent staff from approving their own projects.
    project_data.approved = None

    # Remove project details in order to validate the project.
    project_data_details = project_data.details
    del project_data.details
    project = Project.model_validate(project_data)

    # Serialize and validate project details.
    project_details = []
    for detail in project_data_details:
        # Check if the key and type are consistent with the template before commit.
        template = session.get(ProjectDetailTemplate, detail.key)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid project detail key")

        match template.type:
            case "select" | "radio":
                if detail.value not in template.options:
                    raise HTTPException(status_code=400, detail="Invalid project detail value")
            case "checkbox" | "categories":
                if not all(option in template.options for option in json.loads(detail.value)):
                    raise HTTPException(status_code=400, detail="Invalid project detail value")

        serialize_project_detail(template.type, detail)
        project_detail = ProjectDetail.model_validate(detail)
        project_details.append(project_detail)
    project.details = project_details

    # Create corresponding project proposal.
    proposal = Proposal(proposer=user, proposed_project=project)

    session.add(project)
    session.add_all(project_details)
    session.add(proposal)
    session.commit()

    for detail in project.details:
        parse_project_detail(detail)
    return project


@router.put(
    "/projects/{project_id}",
    response_model=ProjectReadWithDetails,
    dependencies=[Security(check_staff), Security(block_on_proposals_shutdown)],
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
    if not project.proposal or project.proposal.proposer.id != user.id:
        # Only project proposer can edit the project.
        raise HTTPException(status_code=401, detail="Project not proposed by user")

    # Prevent staff from approving their own projects.
    project_data.approved = project.approved

    # Exclude unset fields to perform partial update.
    for key, value in project_data.model_dump(exclude_unset=True, exclude=["details"]).items():
        setattr(project, key, value)

    # Serialize and update the values of corresponding project details.
    project_details = []
    for detail in project_data.details:
        # Check if the key and type are consistent with the template before commit.
        template = session.get(ProjectDetailTemplate, detail.key)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid project detail key")

        match template.type:
            case "select" | "radio":
                if detail.value not in template.options:
                    raise HTTPException(status_code=400, detail="Invalid project detail value")
            case "checkbox" | "categories":
                if not all(option in template.options for option in json.loads(detail.value)):
                    raise HTTPException(status_code=400, detail="Invalid project detail value")

        serialize_project_detail(template.type, detail)
        project_detail = session.get(ProjectDetail, (detail.key, project_id))
        project_detail.value = detail.value
        project_details.append(project_detail)

    session.add(project)
    session.add_all(project_details)
    session.commit()

    for detail in project.details:
        parse_project_detail(detail)
    return project


@router.delete(
    "/projects/{project_id}",
    dependencies=[Security(check_staff), Security(block_on_proposals_shutdown)],
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


@router.post(
    "/projects/{project_id}/status",
    dependencies=[Security(check_admin)],
)
async def set_project_status(
    project_id: str,
    approved: Annotated[bool, Body(embed=True)],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.approved is not None:
        raise HTTPException(status_code=400, detail="Project already approved or disapproved")

    project.approved = approved
    session.add(project)
    session.commit()
    return {"ok": True}


@router.delete(
    "/projects/{project_id}/status",
    dependencies=[Security(check_admin)],
)
async def reset_project_status(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.approved is None:
        raise HTTPException(status_code=400, detail="Project not approved or disapproved")

    project.approved = None
    session.add(project)
    session.commit()
    return {"ok": True}
