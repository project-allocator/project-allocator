from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from ..models import Status
from ..dependencies import check_admin, get_session
from .notifications import create_notifications

router = APIRouter(tags=["admin"])


@router.get(
    "/proposals/shutdown",
    response_model=bool,
    dependencies=[Security(check_admin)],
)
async def are_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    return status.value == "true"


@router.get(
    "/shortlists/shutdown",
    response_model=bool,
    dependencies=[Security(check_admin)],
)
async def are_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    return status.value == "true"


@router.put(
    "/proposals/shutdown",
    dependencies=[Security(check_admin)],
)
async def toggle_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    value = not (True if status.value == "true" else False)
    status.value = str(value).lower()
    session.add(status)
    session.commit()
    if value:
        create_notifications(
            title="Proposals have been shutdown.",
            description="You can no longer shortlist projects.",
            roles=["staff", "admin"],
        )
    else:
        create_notifications(
            title="Proposals have been reopened.",
            description="You can start creating new project proposals",
            roles=["staff", "admin"],
        )
    return {"ok": True}


@router.put(
    "/shortlists/shutdown",
    dependencies=[Security(check_admin)],
)
async def toggle_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    value = not (True if status.value == "true" else False)
    status.value = str(value).lower()
    session.add(status)
    session.commit()
    if value:
        create_notifications(
            title="Shortlists have been shutdown.",
            description="You can no longer shortlist projects.",
            roles=["student"],
        )
    else:
        create_notifications(
            title="Shortlists have been reopened.",
            description="You can start shortlisting projects.",
            roles=["student"],
        )
    return {"ok": True}
