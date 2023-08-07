import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Security
import requests
from sqlmodel import Session, select

from src.config import ROOT_DIR

from ..dependencies import check_admin, get_session, get_token, get_user
from ..models import Notification, NotificationRead, User

router = APIRouter(tags=["notification"])


@router.get("/users/me/notifications", response_model=List[NotificationRead])
async def read_notifications(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    notifications = session.exec(
        select(Notification).where(Notification.user_id == user.id)
    ).all()
    notifications.sort(key=lambda notification: notification.updated_at, reverse=True)
    return notifications


@router.put("/users/me/notifications")
async def mark_notifications(
    notifications: List[NotificationRead],
    session: Session = Depends(get_session),
):
    for notification in notifications:
        notification = session.get(Notification, notification.id)
        notification.seen = True
        session.add(notification)
        session.commit()
    return {"ok": True}


@router.delete("/users/me/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    notification = session.get(Notification, notification_id)
    if not notification.user:
        raise HTTPException(status_code=404, detail="Notification does not exist")
    if notification.user != user:
        raise HTTPException(status_code=401, detail="Notification is not owned")
    session.delete(notification)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/notifications/",
    dependencies=[Security(check_admin)],
)
def send_notifications(
    title: str,
    description: str,
    roles: List[str],
    token: str = Depends(get_token),
    session: Session = Depends(get_session),
):
    # Get the email template.
    with open(f"{ROOT_DIR}/src/resources/email-template.html") as file:
        template = file.read()
    # Get the target users.
    users = session.exec(select(User).where(User.role.in_(roles))).all()
    for user in users:
        # Create notification entries in the database.
        notification = Notification(title=title, description=description)
        user.notifications.append(notification)
        session.add(user)
        session.commit()
        session.refresh(user)
        # Send email to every user as admin.
        data = {
            "message": {
                "subject": f"[Project Allocator] {title}",
                "body": {
                    "contentType": "HTML",
                    "content": template.format(
                        name=user.name,
                        title=title,
                        description=description,
                    ),
                },
                "toRecipients": [{"emailAddress": {"address": user.email}}],
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
