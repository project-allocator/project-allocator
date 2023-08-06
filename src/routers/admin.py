import io
import csv
import json
from typing import List
from fastapi import APIRouter, Depends, Security
from sqlmodel import Session, select

from ..models import (
    Project,
    ProjectImport,
    User,
    UserImport,
    Status,
)
from ..dependencies import check_admin, get_session, send_notifications

router = APIRouter(tags=["admin"])


@router.get("/proposals/shutdown", response_model=bool)
async def are_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    return status.value


@router.get("/shortlists/shutdown", response_model=bool)
async def are_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    return status.value


@router.get("/undos/shutdown", response_model=bool)
async def are_undos_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "undos.shutdown")
    return status.value


@router.post(
    "/proposals/shutdown",
    dependencies=[
        Security(check_admin),
        Depends(
            send_notifications(
                title="Proposals have been shutdown.",
                description="You can no longer shortlist projects.",
                roles=["staff", "admin"],
            )
        ),
    ],
)
async def set_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    status.value = True
    session.add(status)
    session.commit()
    return {"ok": True}


@router.delete(
    "/proposals/shutdown",
    dependencies=[
        Security(check_admin),
        Depends(
            send_notifications(
                title="Proposals have been reopened.",
                description="You can start creating new project proposals",
                roles=["staff", "admin"],
            )
        ),
    ],
)
async def unset_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    status.value = False
    session.add(status)
    session.commit()
    return {"ok": True}


@router.post(
    "/shortlists/shutdown",
    dependencies=[
        Security(check_admin),
        Depends(
            send_notifications(
                title="Shortlists have been shutdown.",
                description="You can no longer shortlist projects.",
                roles=["student"],
            )
        ),
    ],
)
async def set_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    status.value = True
    session.add(status)
    session.commit()
    return {"ok": True}


@router.delete(
    "/shortlists/shutdown",
    dependencies=[
        Security(check_admin),
        Depends(
            send_notifications(
                title="Shortlists have been reopened.",
                description="You can start shortlisting projects.",
                roles=["student"],
            )
        ),
    ],
)
async def unset_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    status.value = False
    session.add(status)
    session.commit()
    return {"ok": True}


@router.post(
    "/projects/undos/shutdown",
    dependencies=[Security(check_admin)],
)
async def set_undos_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "undos.shutdown")
    status.value = True
    session.add(status)
    session.commit()
    return {"ok": True}


@router.delete(
    "/projects/undos/shutdown",
    dependencies=[Security(check_admin)],
)
async def unset_undos_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "undos.shutdown")
    status.value = False
    session.add(status)
    session.commit()
    return {"ok": True}


@router.get(
    "/export/json",
    dependencies=[Security(check_admin)],
)
async def export_json(session: Session = Depends(get_session)):
    output = []
    projects = session.exec(select(Project)).all()
    for project in projects:
        data = json.loads(project.json())
        data["proposer"] = json.loads(project.proposer.json())
        # fmt: off
        data["allocatees"] = list(map(lambda allocatee: json.loads(allocatee.json()), project.allocatees))        
        output.append(data)
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
            "Student Names",
            "Student Emails",
        ]
    )
    projects = session.exec(select(Project)).all()
    for project in projects:
        names = list(map(lambda allocatee: allocatee.name, project.allocatees))
        emails = list(map(lambda allocatee: allocatee.email, project.allocatees))
        writer.writerow(
            [
                project.id,
                project.title,
                project.description,
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
    users: List[UserImport],
    projects: List[ProjectImport],
    session: Session = Depends(get_session),
):
    for user in users:
        user = User.parse_obj(user)
        session.add(user)
        session.commit()
    for project in projects:
        project = Project.parse_obj(project)
        session.add(project)
        session.commit()
    return {"ok": True}


@router.post(
    "/users/missing",
    response_model=List[str],
    dependencies=[Security(check_admin)],
)
async def check_missing_users(
    emails: List[str],
    session: Session = Depends(get_session),
):
    missing = []
    for email in emails:
        user = session.exec(select(User).where(User.email == email)).one_or_none()
        if not user:
            missing.append(email)
    return missing
