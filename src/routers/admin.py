from fastapi import APIRouter, Depends, Security
from sqlmodel import Session

from ..models import Status
from ..dependencies import check_admin, get_session, send_notifications

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
    status.value = "true"
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
    status.value = "false"
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
    status.value = "true"
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
async def unset_shortlists_shutdown(
    session: Session = Depends(get_session),
):
    status = session.get(Status, "shortlists.shutdown")
    status.value = "false"
    session.add(status)
    session.commit()
    return {"ok": True}
