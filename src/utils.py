from typing import List
import requests
from sqlmodel import Session, select

from .models import Notification, User


def send_notifications(
    title: str,
    description: str,
    roles: List[str],
    token: str,
    session: Session,
):
    # Create notifications in the database.
    users = session.exec(select(User).where(User.role.in_(roles))).all()
    for user in users:
        notification = Notification(title=title, description=description)
        user.notifications.append(notification)
        session.add(user)
        session.commit()
        session.refresh(user)
    # Send email to every user as admin.
    recipients = [{"emailAddress": {"address": user.email}} for user in users]
    message = {
        "subject": title,
        "body": {"contentType": "Text", "content": description},
        "toRecipients": recipients,
    }
    requests.post(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        data={
            "message": message,
            "saveToSentItems": "false",
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        timeout=30,
    )
