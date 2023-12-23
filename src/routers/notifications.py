from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session, select
from os.path import dirname, abspath
from datetime import datetime
import requests
import json

from ..dependencies import check_admin, get_user, get_session, get_token
from ..models import User, Notification, NotificationRead, NotificationCreate

router = APIRouter(tags=["notification"])


@router.get("/users/me/notifications", response_model=list[NotificationRead])
async def read_notifications(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    query = select(Notification).where(Notification.user_id == user.id)
    notifications = session.exec(query).all()
    notifications.sort(key=lambda notification: notification.updated_at, reverse=True)
    return notifications


# TODO: This endpoint is semantically misleading
@router.put("/users/me/notifications")
async def mark_notifications(
    notification_ids: list[str],
    session: Session = Depends(get_session),
):
    for notification_id in notification_ids:
        notification = session.get(Notification, notification_id)
        notification.read_at = datetime.now()
        session.add(notification)
    session.commit()
    return {"ok": True}


@router.delete("/users/me/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
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
    "/users/notifications",
    dependencies=[Security(check_admin)],
)
def send_notifications(
    notification_data: NotificationCreate,
    roles: list[str],
    token: str = Depends(get_token),
    session: Session = Depends(get_session),
):
    # Get the email template.
    base_path = dirname(dirname(abspath(__file__)))
    template_path = f"{base_path}/resources/email-template.html"
    with open(template_path) as file:
        template = file.read()

    # Get the target users.
    users = session.exec(select(User).where(User.role.in_(roles))).all()
    for user in users:
        # Create in-app notification.
        notification = Notification.model_validate(notification_data)
        notification.user = user
        session.add(notification)
        session.commit()
        session.refresh(notification)

        # Send email to every user as admin.
        body = {
            "contentType": "HTML",
            "content": template.format(
                name=user.name,
                title=notification.title,
                description=notification.description,
            ),
        }
        data = {
            "message": {
                "subject": f"[Project Allocator] {notification.title}",
                "toRecipients": [{"emailAddress": {"address": user.email}}],
                "body": body,
            },
            "saveToSentItems": "false",
        }
        requests.post(
            "https://graph.microsoft.com/v1.0/me/sendMail",
            data=json.dumps(data),
            timeout=30,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
        )

    return {"ok": True}
