import json
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
    data = {
        "message": {
            "subject": title,
            "body": {"contentType": "Text", "content": description},
            "toRecipients": [{"emailAddress": {"address": "wxc20@ic.ac.uk"}}],
            # "toRecipients": [{"emailAddress": {"address": user.email}} for user in users],
        },
        "saveToSentItems": "false",
    }
    res = requests.post(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        data=json.dumps(data),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        timeout=30,
    ).json()
    print(res)
