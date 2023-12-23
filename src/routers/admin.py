import io
import csv
import json
from typing import Any
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session, select, delete

from ..models import (
    User,
    Project,
    ProjectDetail,
    ProjectDetailConfig,
    Proposal,
    Allocation,
    Shortlist,
    Notification,
    Config,
)
from ..dependencies import check_admin, get_session, get_user

router = APIRouter(tags=["admin"])


@router.get("/proposals/shutdown", response_model=bool)
async def are_proposals_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "proposals.shutdown")
    return config.value == "true"


@router.get("/shortlists/shutdown", response_model=bool)
async def are_shortlists_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "shortlists.shutdown")
    return config.value == "true"


@router.get("/undos/shutdown", response_model=bool)
async def are_undos_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "undos.shutdown")
    return config.value == "true"


@router.post(
    "/proposals/shutdown",
    dependencies=[Security(check_admin)],
)
async def set_proposals_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "proposals.shutdown")
    config.value = "true"
    session.add(config)
    session.commit()
    return {"ok": True}


@router.delete(
    "/proposals/shutdown",
    dependencies=[Security(check_admin)],
)
async def unset_proposals_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "proposals.shutdown")
    config.value = "false"
    session.add(config)
    session.commit()
    return {"ok": True}


@router.post(
    "/shortlists/shutdown",
    dependencies=[Security(check_admin)],
)
async def set_shortlists_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "shortlists.shutdown")
    config.value = "true"
    session.add(config)
    session.commit()
    return {"ok": True}


@router.delete(
    "/shortlists/shutdown",
    dependencies=[Security(check_admin)],
)
async def unset_shortlists_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "shortlists.shutdown")
    config.value = "false"
    session.add(config)
    session.commit()
    return {"ok": True}


@router.post(
    "/projects/undos/shutdown",
    dependencies=[Security(check_admin)],
)
async def set_undos_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "undos.shutdown")
    config.value = "true"
    session.add(config)
    session.commit()
    return {"ok": True}


@router.delete(
    "/projects/undos/shutdown",
    dependencies=[Security(check_admin)],
)
async def unset_undos_shutdown(session: Session = Depends(get_session)):
    config = session.get(Config, "undos.shutdown")
    config.value = "false"
    session.add(config)
    session.commit()
    return {"ok": True}


@router.get(
    "/export/json",
    dependencies=[Security(check_admin)],
)
async def export_json(session: Session = Depends(get_session)):
    output_users = []
    output_projects = []

    users = session.exec(select(User)).all()
    projects = session.exec(select(Project)).all()

    for user in users:
        output_users.append(json.loads(user.model_dump_json()))
    for project in projects:
        output_project = json.loads(project.model_dump_json())
        output_project["details"] = [json.loads(detail.model_dump_json()) for detail in project.details]
        output_project["proposal"] = json.loads(project.proposal.model_dump_json())
        # fmt: off
        output_project["allocations"] = [json.loads(allocation.model_dump_json()) for allocation in project.allocations]
        output_projects.append(output_project)

    output = {"users": output_users, "projects": output_projects}
    return json.dumps(output)


@router.get(
    "/export/csv",
    dependencies=[Security(check_admin)],
)
async def export_csv(session: Session = Depends(get_session)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Project ID",
            "Project Title",
            "Project Description",
            "Proposer Name",
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
                project.proposal.proposer.name,
                ",".join(names),
                ",".join(emails),
            ]
        )
    return output.getvalue()


@router.post(
    "/import/json",
    dependencies=[Security(check_admin)],
)
async def import_json(
    users: dict[str, Any],
    projects: dict[str, Any],
    session: Session = Depends(get_session),
):
    for user in users:
        user = User.model_validate(user)
        session.add(user)
        session.commit()
    for project in projects:
        project_details = project.details
        project_allocations = project.allocations
        project_proposal = project.proposal
        del project.details
        del project.allocations
        del project.proposal
        project = Project.model_validate(project)
        project_details = [ProjectDetail.model_validate(detail) for detail in project_details]
        project_allocations = [Allocation.model_validate(allocation) for allocation in project_allocations]
        project_proposal = Proposal.model_validate(project_proposal)
        session.add(project)
        session.add_all(project_details)
        session.add_all(project_allocations)
        session.add(project_proposal)
        session.commit()
    return {"ok": True}


@router.post(
    "/database/reset",
    dependencies=[Security(check_admin)],
)
async def reset_database(
    user: User | None = Depends(get_user),
    session: Session = Depends(get_session),
):
    session.exec(delete(User))
    session.exec(delete(Project))
    session.exec(delete(ProjectDetail))
    session.exec(delete(ProjectDetailConfig))
    session.exec(delete(Allocation))
    session.exec(delete(Proposal))
    session.exec(delete(Shortlist))
    session.exec(delete(Notification))
    # Do not delete Config
    # session.exec(delete(Config))

    session.add(User(email=user.email, name=user.name, role=user.role))
    session.commit()
    return {"ok": True}
