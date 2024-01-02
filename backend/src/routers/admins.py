from typing import Annotated, Any
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select, delete
import io
import csv
import json

from ..dependencies import (
    check_admin,
    get_session,
)
from ..utils.projects import (
    parse_project,
    serialize_project_detail,
)
from ..models import (
    User,
    UserRead,
    Project,
    ProjectRead,
    ProjectDetail,
    ProjectDetailRead,
    ProjectDetailTemplate,
    Proposal,
    Allocation,
    Shortlist,
    Notification,
)
from ..logger import LoggerRoute

router = APIRouter(tags=["admin"], route_class=LoggerRoute)


@router.post(
    "/admins/missing-users",
    response_model=list[str],
    dependencies=[Security(check_admin)],
)
async def check_missing_users(
    emails: list[str],
    session: Annotated[Session, Depends(get_session)],
):
    missing = []
    for email in emails:
        query = select(User).where(User.email == email)
        user = session.exec(query).one_or_none()
        if not user:
            missing.append(email)
    return missing


@router.get(
    "/admins/conflicting-projects",
    response_model=list[ProjectRead],
    dependencies=[Security(check_admin)],
)
async def read_conflicting_projects(session: Annotated[Session, Depends(get_session)]):
    # Only show approved projects.
    # 'Project.approved == True' does seem to be redundant
    # but is required by SQLModel to construct a valid query.
    query = select(Project).where(Project.approved == True)
    projects = session.exec(query).all()
    return [project for project in projects if not all([allocation.accepted for allocation in project.allocations])]


@router.get(
    "/admins/export/json",
    dependencies=[Security(check_admin)],
)
async def export_json(session: Annotated[Session, Depends(get_session)]):
    users_data = []
    projects_data = []

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()

    for user in users:
        user_data = UserRead.model_validate(user)
        users_data.append(user_data.model_dump())

    for project in projects:
        project_data = parse_project(project)
        project_data = project_data.model_dump()
        project_data["proposal"] = project.proposal.model_dump()
        project_data["allocations"] = [allocation.model_dump() for allocation in project.allocations]
        projects_data.append(project_data)

    output = {"users": users_data, "projects": projects_data}
    # Using default=str to serialize datetime.
    return json.dumps(output, default=str)


@router.get(
    "/admins/export/csv",
    dependencies=[Security(check_admin)],
)
async def export_csv(session: Annotated[Session, Depends(get_session)]):
    output = io.StringIO()
    writer = csv.writer(output)

    templates = session.exec(select(ProjectDetailTemplate)).all()
    writer.writerow(
        [
            "Project ID",
            "Project Title",
            "Project Description",
            "Project Approved",
            *[f"Project Detail: {template.title}" for template in templates],
            "Proposer Name",
            "Proposer Email",
            "Allocatee Names",
            "Allocatee Emails",
        ]
    )

    projects = session.exec(select(Project)).all()
    for project in projects:
        project_data = parse_project(project)
        names = [allocation.allocatee.name for allocation in project.allocations]
        emails = [allocation.allocatee.email for allocation in project.allocations]
        writer.writerow(
            [
                project_data.id,
                project_data.title,
                project_data.description,
                project_data.approved,
                *[detail.value for detail in project_data.details],
                project.proposal.proposer.name,
                project.proposal.proposer.email,
                ",".join(names),
                ",".join(emails),
            ]
        )

    return output.getvalue()


@router.post(
    "/admins/import/json",
    dependencies=[Security(check_admin)],
)
async def import_json(
    users: list[Any],
    projects: list[Any],
    session: Annotated[Session, Depends(get_session)],
):
    for user in users:
        user = User.model_validate(user)
        session.add(user)

    for project in projects:
        details_data = project["details"]
        proposal_data = project["proposal"]
        allocations_data = project["allocations"]
        del project["details"]
        del project["allocations"]
        del project["proposal"]

        # We need to use ProjectRead/ProjectDetailRead rather than ProjectCreate/ProjectDetailCreate
        # because we expect IDs to be present.
        project_data = ProjectRead.model_validate(project)
        details_data = [ProjectDetailRead.model_validate(detail) for detail in details_data]

        project = Project.model_validate(project_data)
        session.add(project)

        for detail_data in details_data:
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

        proposal = Proposal.model_validate(proposal_data)
        session.add(proposal)

        allocations = [Allocation.model_validate(allocation) for allocation in allocations_data]
        session.add_all(allocations)

    session.commit()
    return {"ok": True}


@router.post(
    "/admins/database/reset",
    dependencies=[Security(check_admin)],
)
async def reset_database(session: Annotated[Session, Depends(get_session)]):
    admins = session.exec(select(User).where(User.role == "admin")).all()

    session.exec(delete(User))
    session.exec(delete(Project))
    session.exec(delete(ProjectDetail))
    # Do not delete ProjectDetailTemplate
    # session.exec(delete(ProjectDetailTemplate))
    session.exec(delete(Proposal))
    session.exec(delete(Allocation))
    session.exec(delete(Shortlist))
    session.exec(delete(Notification))
    # Do not delete Config
    # session.exec(delete(Config))

    for admin in admins:
        session.add(User(email=admin.email, name=admin.name, role=admin.role))
    session.commit()
    return {"ok": True}
