from fastapi.testclient import TestClient
from requests_mock import Mocker


def test_read_current_user(student_client: TestClient):
    response = student_client.get("/api/users/me")
    data = response.json()
    assert response.status_code == 200
    assert data["name"] == "Bob Smith"


def test_read_user(student_client: TestClient):
    response = student_client.get("/api/users/1")
    data = response.json()
    assert response.status_code == 200
    assert data["name"] == "Bob Smith"


def test_read_users(student_client: TestClient):
    response = student_client.get("/api/users")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == 3
    assert [user["name"] for user in data] == [
        "Bob Smith",
        "Alice Smith",
        "Charlie Smith",
    ]


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
    assert len(data) == 4
    assert [user["name"] for user in data] == [
        "Bob Smith",
        "Alice Smith",
        "Charlie Smith",
        "David Smith",
    ]


def test_update_user(admin_client: TestClient):
    response = admin_client.put("/api/users/1", json={"role": "staff"})
    assert response.status_code == 200

    response = admin_client.get("/api/users/1")
    data = response.json()
    assert data["role"] == "staff"


def test_delete_user(admin_client: TestClient):
    response = admin_client.delete("/api/users/1")
    data = response.json()
    assert response.status_code == 200
    assert data["ok"] is True

    response = admin_client.delete("/api/users/1")
    assert response.status_code == 404
