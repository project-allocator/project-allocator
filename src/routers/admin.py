from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import Session

from ..models import Status
from ..dependencies import get_session

router = APIRouter(tags=["admin"])


@router.get("/proposals/shutdown", response_model=bool)
async def are_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    return status.value == "true"


@router.get("/shortlists/shutdown", response_model=bool)
async def are_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    return status.value == "true"


@router.put("/proposals/shutdown")
async def toggle_proposals_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    status.value = "false" if status.value == "true" else "true"
    session.add(status)
    session.commit()
    return {"ok": True}


@router.put("/shortlists/shutdown")
async def toggle_shortlists_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    status.value = "false" if status.value == "true" else "true"
    session.add(status)
    session.commit()
    return {"ok": True}
