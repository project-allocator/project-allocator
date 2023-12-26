from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.models import Config


def test_read_configs(admin_client: TestClient, session: Session):
    configs = session.exec(select(Config)).all()

    response = admin_client.get("/api/configs")
    data = response.json()
    assert response.status_code == 200

    assert len(data) == len(configs)
    assert set(config["key"] for config in data) == set(config.key for config in configs)


def test_update_config(admin_client: TestClient):
    key = "admin_emails"
    value = ["alice@ic.ac.uk", "bob@ic.ac.uk"]

    response = admin_client.put(f"/api/configs/{key}", json=value)
    data = response.json()
    assert response.status_code == 200

    assert data["key"] == key
    assert data["value"] == value

    key = "does_not_exist"
    value = ""

    response = admin_client.put(f"/api/configs/{key}", json=value)
    data = response.json()
    assert response.status_code == 404
