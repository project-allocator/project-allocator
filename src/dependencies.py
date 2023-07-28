import json
from typing import List
from fastapi import Depends, HTTPException, Header
from fastapi_azure_auth.user import User as AzureUser
import requests
from sqlmodel import Session, select

from .models import Notification, Status, User
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


def get_token(x_graph_token: str | None = Header(default=None)):
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


def send_notifications(
    title: str,
    description: str,
    roles: List[str],
):
    def dependency(
        token: str = Depends(get_token),
        session: Session = Depends(get_session),
    ):
        # Yield and wait for the path operation to finish
        # https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/#dependencies-with-yield-and-httpexception
        yield
        # Create notifications in the database.
        users = session.exec(select(User).where(User.role.in_(roles))).all()
        for user in users:
            notification = Notification(title=title, description=description)
            user.notifications.append(notification)
            session.add(user)
            session.commit()
            session.refresh(user)
        # Send email to every user as admin.
        data = {
            "message": {
                "subject": title,
                "body": {"contentType": "Text", "content": description},
                "toRecipients": [{"emailAddress": {"address": "tm821@ic.ac.uk"}}],
                # "toRecipients": [{"emailAddress": {"address": user.email}} for user in users],
            },
            "saveToSentItems": "false",
        }
        requests.post(
            "https://graph.microsoft.com/v1.0/me/sendMail",
            data=json.dumps(data),
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )

    return dependency
