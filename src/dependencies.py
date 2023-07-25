from http.client import HTTPException
from fastapi.params import Depends
from sqlmodel import Session

from .models import Status
from .db import engine


def get_session():
    with Session(engine) as session:
        yield session


def block_proposals_if_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    if status.value == "true":
        raise HTTPException(status_code=400, detail="Proposals are currently shutdown")


def block_shortlists_if_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    if status.value == "true":
        raise HTTPException(status_code=400, detail="Shortlists are currently shutdown")
