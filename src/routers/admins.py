from operator import and_
from typing import Annotated, Any
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session, select, delete
import io
import csv
import json

from ..models import (
    User,
    UserRead,
    Project,
    ProjectRead,
    ProjectDetail,
    ProjectDetailTemplate,
    Proposal,
    Allocation,
    Shortlist,
    Notification,
)
from ..dependencies import check_admin, get_session

router = APIRouter(tags=["admin"])


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
    "/admins/unallocated-users",
    response_model=list[UserRead],
    dependencies=[Security(check_admin)],
)
async def read_unallocated_users(session: Annotated[Session, Depends(get_session)]):
    query = select(User).where(and_(User.role == "student", User.allocation == None))
    return session.exec(query).all()


@router.get(
    "/admins/export/json",
    dependencies=[Security(check_admin)],
)
async def export_json(session: Annotated[Session, Depends(get_session)]):
    output_users = []
    output_projects = []

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()

    for user in users:
        output_users.append(user.model_dump())
    for project in projects:
        output_project = project.model_dump()
        output_project["details"] = [detail.model_dump() for detail in project.details]
        output_project["proposal"] = project.proposal.model_dump()
        output_project["allocations"] = [allocation.model_dump() for allocation in project.allocations]
        output_projects.append(output_project)

    output = {"users": output_users, "projects": output_projects}
    # Use default=str to serialize datetime.
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
        names = [allocation.allocatee.name for allocation in project.allocations]
        emails = [allocation.allocatee.email for allocation in project.allocations]
        writer.writerow(
            [
                project.id,
                project.title,
                project.description,
                project.approved,
                *[detail.value for detail in project.details],
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
        session.commit()
    for project in projects:
        project_details = project["details"]
        project_allocations = project["allocations"]
        project_proposal = project["proposal"]
        del project["details"]
        del project["allocations"]
        del project["proposal"]
        project = Project.model_validate(project)
        project_details = [ProjectDetail.model_validate(detail) for detail in project_details]
        project_allocations = [Allocation.model_validate(allocation) for allocation in project_allocations]
        project_proposal = Proposal.model_validate(project_proposal)
        session.add(project)
        session.add_all(project_details)
        session.add(project_proposal)
        session.add_all(project_allocations)
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
