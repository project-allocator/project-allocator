from fastapi import FastAPI
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from src.main import app
from src.auth import azure_scheme
from src.dependencies import get_session, get_token, get_user_or_none
from src.models import Config, User


@pytest.fixture(name="student_user")
def student_user_fixture():
    return User(
        id="01HJARDCE2VD23YCQPQ9MDTS63",
        email="bob@example.com",
        name="Bob Smith",
        role="student",
    )


@pytest.fixture(name="staff_user")
def staff_user_fixture():
    return User(
        id="01HJARDCE2CB6EW40A8AG7E5A3",
        email="alice@example.com",
        name="Alice Smith",
        role="staff",
    )


@pytest.fixture(name="admin_user")
def admin_user_fixture():
    return User(
        id="01HJARDCE2WRJT4DJ3CAZA6ECX",
        email="charlie@example.com",
        name="Charlie Smith",
        role="admin",
    )


@pytest.fixture(name="default_users")
def default_users_fixture(admin_user: User, staff_user: User, student_user: User):
    return [admin_user, staff_user, student_user]


@pytest.fixture(name="session")
def session_fixture(default_users: list[User]):
    # Setup a temporary SQLite database for testing.
    # Uses SQLite in-memory database.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # User table is filled with mock data.
        # The rest of the tables are empty and must be fed with mock data before testing.
        session.add_all(default_users)
        session.commit()

        # Set default config values for the Project Allocator.
        session.add(Config(key="admin_emails", value='["rbc@ic.ac.uk"]'))
        session.add(Config(key="allocations_per_project", value="5"))
        session.add(Config(key="proposals.shutdown", value="false"))
        session.add(Config(key="shortlists.shutdown", value="false"))
        session.add(Config(key="undos.shutdown", value="false"))
        session.commit()

        yield session


@pytest.fixture(name="app")
def app_fixture(session: Session):
    # We mock FastAPI dependencies by overriding them with our own functions.
    app.dependency_overrides[get_session] = lambda: session

    # We only use azure_scheme as dependency to implement get_user_or_none
    # so by overriding get_user_or_none to return a mock user in client fixtures
    # we can override azure_scheme to return None.
    app.dependency_overrides[azure_scheme] = lambda: None

    # Bearer token for Microsoft Graph API is not needed for testing.
    app.dependency_overrides[get_token] = lambda: ""

    yield app

    app.dependency_overrides.clear()


@pytest.fixture(name="guest_client")
def client_guest_fixture(app: FastAPI):
    app.dependency_overrides[get_user_or_none] = lambda: None

    yield TestClient(app)


@pytest.fixture(name="student_client")
def client_student_fixture(app: FastAPI, student_user: User):
    app.dependency_overrides[get_user_or_none] = lambda: student_user

    yield TestClient(app)


@pytest.fixture(name="staff_client")
def client_staff_fixture(app: FastAPI, staff_user: User):
    app.dependency_overrides[get_user_or_none] = lambda: staff_user

    yield TestClient(app)


@pytest.fixture(name="admin_client")
def client_admin_fixture(app: FastAPI, admin_user: User):
    app.dependency_overrides[get_user_or_none] = lambda: admin_user

    yield TestClient(app)
