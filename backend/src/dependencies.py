import os
from functools import lru_cache
from typing import Optional

from fastapi import Depends, Header, HTTPException
from fastapi_azure_auth.user import User as AzureUser
from sqlalchemy import create_engine
from sqlmodel import Session, select

from .auth import azure_scheme
from .db import DATABASE_URL
from .models import Config, User


def get_env():
    return os.environ.get("FASTAPI_ENV")


@lru_cache()
def get_engine():
    return create_engine(DATABASE_URL)


def get_session(engine=Depends(get_engine)):
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


def get_token(x_graph_token: Optional[str] = Header(default=None)):
    if not x_graph_token:
        raise HTTPException(status_code=404, detail="Graph access token not found.")
    return x_graph_token


def check_admin(user=Depends(get_user)):
    if user.role != "admin":
        raise HTTPException(status_code=401, detail="User is not admin.")


def check_staff(user=Depends(get_user)):
    if user.role != "staff" and user.role != "admin":
        raise HTTPException(status_code=401, detail="User is not staff.")


def check_student(user=Depends(get_user)):
    if user.role != "student":
        raise HTTPException(status_code=401, detail="User is not student.")


def block_on_proposals_shutdown(session: Session = Depends(get_session)):
    proposals_shutdown = session.get(Config, "proposals_shutdown")
    if proposals_shutdown.value == "true":
        raise HTTPException(
            status_code=403,
            detail="Proposals are currently shutdown.",
        )


def block_on_shortlists_shutdown(session: Session = Depends(get_session)):
    shortlists_shutdown = session.get(Config, "shortlists_shutdown")
    if shortlists_shutdown.value == "true":
        raise HTTPException(
            status_code=403,
            detail="Shortlists are currently shutdown.",
        )
