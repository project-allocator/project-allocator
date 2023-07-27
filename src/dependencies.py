from fastapi import Depends, HTTPException
from fastapi_azure_auth.user import User as AzureUser
from sqlmodel import Session, select

from .models import Status, User
from .db import engine
from .auth import azure_scheme


def get_session():
    with Session(engine) as session:
        yield session


def get_user_or_none(
    user: AzureUser = Depends(azure_scheme),
    session: Session = Depends(get_session),
):
    email = user.preferred_username
    return session.exec(select(User).where(User.email == email)).one_or_none()


def get_user(user=Depends(get_user_or_none)):
    if not user:
        raise HTTPException(status_code=404, detail="User is not in the database.")
    return user


def check_admin(user=Depends(get_user)):
    if user.role != "admin":
        raise HTTPException(status_code=401, detail="User is not admin.")


def check_staff(user=Depends(get_user)):
    if user.role != "staff" and user.role != "admin":
        raise HTTPException(status_code=401, detail="User is not staff.")


def check_student(user=Depends(get_user)):
    if user.role != "student":
        raise HTTPException(status_code=401, detail="User is not student.")


def block_proposals_if_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "proposals.shutdown")
    if status.value == "true":
        raise HTTPException(
            status_code=403,
            detail="Proposals are currently shutdown.",
        )


def block_shortlists_if_shutdown(session: Session = Depends(get_session)):
    status = session.get(Status, "shortlists.shutdown")
    if status.value == "true":
        raise HTTPException(
            status_code=403,
            detail="Shortlists are currently shutdown.",
        )
