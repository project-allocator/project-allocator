from fastapi.testclient import TestClient
from sqlmodel import Session, select
from src.models import Notification, User
from requests_mock import Mocker


def test_read_notifications(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    notifications = [
        Notification(
            title="New Notification",
            description="New Notification",
            seen=False,
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
    notifications = [
        Notification(
            title="Old Notification",
            description="Old Notification",
            seen=False,
            user=student_user,
        )
        for _ in range(10)
    ]
    session.add_all(notifications)
    session.commit()

    response = student_client.put(
        "/api/users/me/notifications",
        json=[{"id": notification.id, "seen": True} for notification in notifications],
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    for notification in notifications:
        session.refresh(notification)
        assert notification.seen is True


def test_delete_notification(
    student_user: User,
    student_client: TestClient,
    session: Session,
):
    notification = Notification(
        title="New Notification",
        description="New Notification",
        seen=False,
        user=student_user,
    )
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
    requests_mock.post(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        # The response is not important.
        json={},
    )
    response = admin_client.post(
        "/api/users/notifications",
        params={
            "title": "New Notification",
            "description": "New Notification",
        },
        json=["student"],
    )
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    roles = ["student"]
    users = session.exec(select(User).where(User.role.in_(roles))).all()
    for user in users:
        assert len(user.notifications) == 1
        assert user.notifications[0].title == "New Notification"
        assert user.notifications[0].description == "New Notification"

    history = requests_mock.request_history
    assert len(history) == len(users)
    for event in history:
        assert event.method == "POST"
        assert event.url == "https://graph.microsoft.com/v1.0/me/sendMail"
