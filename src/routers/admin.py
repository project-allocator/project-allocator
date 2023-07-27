from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from ..models import Status
from ..dependencies import check_admin, get_session, get_token
from ..utils import send_notifications

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
async def toggle_proposals_shutdown(
    token: str | None = Depends(get_token),
    session: Session = Depends(get_session),
):
    status = session.get(Status, "proposals.shutdown")
    value = not (True if status.value == "true" else False)
    status.value = str(value).lower()
    session.add(status)
    session.commit()
    send_notifications(
        title=value
        and "Proposals have been shutdown."
        or "Proposals have been reopened.",
        description=value
        and "You can no longer shortlist projects."
        or "You can start creating new project proposals",
        roles=["staff", "admin"],
        token=token,
        session=session,
    )
    return {"ok": True}


@router.put(
    "/shortlists/shutdown",
    dependencies=[Security(check_admin)],
)
async def toggle_shortlists_shutdown(
    token: str | None = Depends(get_token),
    session: Session = Depends(get_session),
):
    status = session.get(Status, "shortlists.shutdown")
    value = not (True if status.value == "true" else False)
    status.value = str(value).lower()
    session.add(status)
    session.commit()
    send_notifications(
        title=value
        and "Shortlists have been shutdown."
        or "Shortlists have been reopened.",
        description=value
        and "You can no longer shortlist projects."
        or "You can start shortlisting projects.",
        roles=["student"],
        token=token,
        session=session,
    )
    return {"ok": True}
