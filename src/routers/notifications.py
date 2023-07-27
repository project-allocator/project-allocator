from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import engine
from ..dependencies import get_session, get_user
from ..models import Notification, NotificationRead, User

router = APIRouter(tags=["notification"])


def create_notifications(title: str, description: str, roles: List[str]):
    with Session(engine) as session:
        users = session.exec(select(User).where(User.role.in_(roles))).all()
        for user in users:
            notification = Notification(title=title, description=description)
            user.notifications.append(notification)
            session.add(user)
            session.commit()


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


@router.post("/users/me/notifications")
async def mark_notifications(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    notifications = session.exec(
        select(Notification).where(Notification.user_id == user.id)
    ).all()
    for notification in notifications:
        notification.seen = True
        session.add(notification)
        session.commit()
    return {"ok": True}


@router.delete("/users/me/notifications/{id}")
async def delete_notification(
    id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    notification = session.get(Notification, id)
    if notification.user != user:
        raise HTTPException(
            status_code=401, detail="Notification does not belong to user"
        )
    session.delete(notification)
    session.commit()
    return {"ok": True}
