from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session, select

from ..dependencies import (
    block_on_proposals_shutdown,
    check_admin,
    check_staff,
    get_session,
    get_user,
)
from ..utils.projects import (
    parse_project,
    serialize_project_detail,
)
from ..models import (
    User,
    Project,
    ProjectReadWithProposal,
    ProjectReadWithDetails,
    ProjectCreateWithDetails,
    ProjectUpdateWithDetails,
    ProjectDetail,
    ProjectDetailTemplate,
    Proposal,
)
from ..logger import LoggerRoute

router = APIRouter(tags=["project"], route_class=LoggerRoute)


@router.get(
    "/projects/approved",
    response_model=list[ProjectReadWithProposal],
)
async def read_approved_projects(
    session: Annotated[Session, Depends(get_session)],
):
    # Sort the projects so that the last updated project is returned first.
    query = select(Project).where(Project.approved == True)
    projects = session.exec(query).all()
    projects.sort(key=lambda project: project.updated_at, reverse=True)

    return projects


@router.get(
    "/projects/disapproved",
    response_model=list[ProjectReadWithProposal],
    dependencies=[Security(check_admin)],  # only admins
)
async def read_disapproved_projects(
    session: Annotated[Session, Depends(get_session)],
):
    query = select(Project).where(Project.approved == False)
    projects = session.exec(query).all()
    projects.sort(key=lambda project: project.updated_at, reverse=True)

    return projects


@router.get(
    "/projects/no-response",
    response_model=list[ProjectReadWithProposal],
    dependencies=[Security(check_admin)],  # only admins
)
async def read_no_response_projects(
    session: Annotated[Session, Depends(get_session)],
):
    query = select(Project).where(Project.approved == None)
    projects = session.exec(query).all()
    projects.sort(key=lambda project: project.updated_at, reverse=True)

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

    return parse_project(project)


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
    details_data = project_data.details
    del project_data.details
    project = Project.model_validate(project_data)
    session.add(project)

    # Serialize and validate project details.
    for detail_data in details_data:
        # Check if the key and type are consistent with the template before commit.
        template = session.get(ProjectDetailTemplate, detail_data.key)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid project detail key")

        match template.type:
            case "select" | "radio":
                if detail_data.value not in template.options:
                    raise HTTPException(status_code=400, detail="Invalid project detail value")
            case "checkbox":
                if not all(option in template.options for option in detail_data.value):
                    raise HTTPException(status_code=400, detail="Invalid project detail value")

        detail_data = serialize_project_detail(template, detail_data)
        detail = ProjectDetail.model_validate(detail_data)
        detail.project = project
        session.add(detail)

    # Create corresponding project proposal.
    proposal = Proposal(proposer=user, proposed_project=project)
    session.add(proposal)

    session.commit()

    return parse_project(project)


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
    details_data = project_data.details
    del project_data.details
    for key, value in project_data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    session.add(project)

    # Serialize and update the values of corresponding project details.
    for detail_data in details_data:
        # Check if the key and type are consistent with the template before commit.
        template = session.get(ProjectDetailTemplate, detail_data.key)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid project detail key")

        match template.type:
            case "select" | "radio":
                if detail_data.value not in template.options:
                    raise HTTPException(status_code=400, detail="Invalid project detail value")
            case "checkbox":
                if not all(option in template.options for option in detail_data.value):
                    raise HTTPException(status_code=400, detail="Invalid project detail value")

        detail_data = serialize_project_detail(template, detail_data)
        detail = session.get(ProjectDetail, (detail_data.key, project_id))
        detail.value = detail_data.value
        session.add(detail)

    session.commit()

    return parse_project(project)


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
    if not project.proposal or project.proposal.proposer.id != user.id:
        raise HTTPException(status_code=401, detail="Project not proposed by user")

    # We use cascade delete to make sure that
    # the project's details, proposals, allocations and shortlists are also deleted.
    session.delete(project)
    session.commit()
    return {"ok": True}


@router.post(
    "/projects/{project_id}/approve",
    dependencies=[Security(check_admin)],
)
async def approve_project(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.approved = True
    session.add(project)
    session.commit()
    return {"ok": True}


@router.post(
    "/projects/{project_id}/disapprove",
    dependencies=[Security(check_admin)],
)
async def disapprove_project(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.approved = False
    session.add(project)
    session.commit()
    return {"ok": True}
