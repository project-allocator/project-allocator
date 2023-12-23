from fastapi.testclient import TestClient
from sqlmodel import Session, select
from requests_mock import Mocker

from src.models import User, Notification
from src.factories import UserFactory, NotificationFactory


def test_read_notifications(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    notifications = [
        Notification(
            title="New Notification",
            description="New Notification",
            user=student_user,
        )
        for _ in range(10)
    ]
    session.add_all(notifications)
    session.commit()

    response = student_client.get("/api/users/me/notifications")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(notifications)
    # fmt: off
    assert set([notification["title"] for notification in data]) \
        == set([notification.title for notification in notifications])


def test_mark_notifications(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    notifications = NotificationFactory.build_batch(10, user=student_user)
    session.add_all(notifications)
    session.commit()

    response = student_client.put(
        "/api/users/me/notifications",
        json=[notification.id for notification in notifications],
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    for notification in notifications:
        session.refresh(notification)
        assert notification.read_at is not None


def test_delete_notification(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    notification = NotificationFactory.build(user=student_user)
    session.add(notification)
    session.commit()

    response = student_client.delete(f"/api/users/me/notifications/{notification.id}")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    notification = session.get(Notification, notification.id)
    assert notification is None


def test_send_notifications(
    admin_client: TestClient,
    session: Session,
    requests_mock: Mocker,
):
    student = UserFactory.build(role="student")
    session.add(student)
    session.commit()

    notification = NotificationFactory.build()
    roles = ["student"]

    requests_mock.post("https://graph.microsoft.com/v1.0/me/sendMail", json={})  # response ignored
    response = admin_client.post(
        "/api/users/notifications",
        json={
            "notification_data": notification.model_dump(include=["title", "description"]),
            "roles": roles,
        },
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    query = select(User).where(User.role.in_(roles))
    users = session.exec(query).all()
    for user in users:
        assert len(user.notifications) == 1
        assert user.notifications[0].title == notification.title
        assert user.notifications[0].description == notification.description

    history = requests_mock.request_history
    assert len(history) == len(users)
    for event in history:
        assert event.method == "POST"
        assert event.url == "https://graph.microsoft.com/v1.0/me/sendMail"
