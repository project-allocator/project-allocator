from fastapi.testclient import TestClient
from requests_mock import Mocker
from sqlmodel import Session
from src.models import User


def test_read_current_user(student_client: TestClient):
    response = student_client.get("/api/users/me")
    data = response.json()
    assert response.status_code == 200

    assert data["name"] == "Alice Smith"


def test_read_user(student_client: TestClient):
    response = student_client.get("/api/users/01HJARDCE2VD23YCQPQ9MDTS63")
    data = response.json()
    assert response.status_code == 200

    assert data["name"] == "Alice Smith"


def test_read_users(student_client: TestClient):
    response = student_client.get("/api/users")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == 3
    assert set([user["name"] for user in data]) == set(["Alice Smith", "Bob Smith", "Charlie Smith"])


def test_create_user(guest_client: TestClient, requests_mock: Mocker):
    # Mock request to Microsoft Graph API
    requests_mock.get(
        "https://graph.microsoft.com/v1.0/me",
        json={
            "jobTitle": "Undergraduate",
            "userPrincipalName": "david@example.com",
            "givenName": "David",
            "surname": "Smith",
        },
    )
    response = guest_client.post("/api/users")
    assert response.status_code == 200

    response = guest_client.get("/api/users")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == 4
    assert set([user["name"] for user in data]) == set(["Bob Smith", "Alice Smith", "Charlie Smith", "David Smith"])


def test_update_user(admin_client: TestClient, session: Session):
    response = admin_client.put("/api/users/01HJARDCE2VD23YCQPQ9MDTS63", json={"role": "staff"})
    assert response.status_code == 200

    user = session.get(User, "01HJARDCE2VD23YCQPQ9MDTS63")
    assert user.role == "staff"


def test_delete_user(admin_client: TestClient, session: Session):
    response = admin_client.delete("/api/users/01HJARDCE2VD23YCQPQ9MDTS63")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    user = session.get(User, "01HJARDCE2VD23YCQPQ9MDTS63")
    assert user is None
