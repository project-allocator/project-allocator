import json

from fastapi.testclient import TestClient
from sqlmodel import Session
from src.models import Config


def test_read_config(admin_client: TestClient, session: Session):
    config = session.get(Config, "admin_emails")

    response = admin_client.get("/api/configs/admin_emails")
    data = response.json()
    assert response.status_code == 200

    assert data["key"] == config.key
    assert data["value"] == json.loads(config.value)


def test_update_config(admin_client: TestClient):
    key = "admin_emails"
    value = ["alice@ic.ac.uk", "bob@ic.ac.uk"]

    response = admin_client.put(f"/api/configs/{key}", json={"value": value})
    data = response.json()
    assert response.status_code == 200

    assert data["key"] == key
    assert data["value"] == value
