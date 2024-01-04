from typing import Annotated, Any
from fastapi import APIRouter, HTTPException, Depends, Security
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
)
from ..models import (
    User,
    Project,
    ProjectReadWithProposal,
    ProjectDetail,
    ProjectDetailTemplate,
    Proposal,
    Allocation,
    Shortlist,
    Notification,
    Config,
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
    response_model=list[ProjectReadWithProposal],
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


@router.get(
    "/admins/export/json",
    dependencies=[Security(check_admin)],
)
async def export_json(session: Annotated[Session, Depends(get_session)]):
    data = {
        "users": [],
        "projects": [],
        "project_details": [],
        "project_detail_templates": [],
        "proposals": [],
        "allocations": [],
        "shortlists": [],
        "notifications": [],
        "configs": [],
    }

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()
    project_details = session.exec(select(ProjectDetail)).all()
    project_detail_templates = session.exec(select(ProjectDetailTemplate)).all()
    proposals = session.exec(select(Proposal)).all()
    allocations = session.exec(select(Allocation)).all()
    shortlists = session.exec(select(Shortlist)).all()
    notifications = session.exec(select(Notification)).all()
    configs = session.exec(select(Config)).all()

    for user in users:
        data["users"].append(user.model_dump())
    for project in projects:
        data["projects"].append(project.model_dump())
    for project_detail in project_details:
        data["project_details"].append(project_detail.model_dump())
    for project_detail_template in project_detail_templates:
        data["project_detail_templates"].append(project_detail_template.model_dump())
    for proposal in proposals:
        data["proposals"].append(proposal.model_dump())
    for allocation in allocations:
        data["allocations"].append(allocation.model_dump())
    for shortlist in shortlists:
        data["shortlists"].append(shortlist.model_dump())
    for notification in notifications:
        data["notifications"].append(notification.model_dump())
    for config in configs:
        data["configs"].append(config.model_dump())

    # Using default=str to serialize datetime.
    return json.dumps(data, default=str)


@router.post(
    "/admins/import/json",
    dependencies=[Security(check_admin)],
)
async def import_json(
    data: dict[str, Any],
    session: Annotated[Session, Depends(get_session)],
):
    for user in data["users"]:
        session.add(User.model_validate(user))
    for project in data["projects"]:
        session.add(Project.model_validate(project))
    for project_detail in data["project_details"]:
        session.add(ProjectDetail.model_validate(project_detail))
    for project_detail_template in data["project_detail_templates"]:
        session.add(ProjectDetailTemplate.model_validate(project_detail_template))
    for proposal in data["proposals"]:
        session.add(Proposal.model_validate(proposal))
    for allocation in data["allocations"]:
        session.add(Allocation.model_validate(allocation))
    for shortlist in data["shortlists"]:
        session.add(Shortlist.model_validate(shortlist))
    for notification in data["notifications"]:
        session.add(Notification.model_validate(notification))
    for config in data["configs"]:
        session.add(Config.model_validate(config))

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
