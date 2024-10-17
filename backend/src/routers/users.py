import json
from typing import Annotated, Optional

import requests
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select

from ..dependencies import (
    check_admin,
    get_session,
    get_token,
    get_user,
    get_user_or_none,
)
from ..logger import LoggerRoute
from ..models import Config, User, UserRead, UserUpdate

router = APIRouter(tags=["user"], route_class=LoggerRoute)


@router.get(
    "/users",
    response_model=list[UserRead],
)
async def read_users(
    *,  # prevent default parameter ordering error
    role: Optional[str] = None,
    session: Annotated[Session, Depends(get_session)],
):
    if not role:
        return session.exec(select(User)).all()

    query = select(User).where(User.role == role)
    return session.exec(query).all()


@router.get(
    "/users/me",
    response_model=UserRead,
)
async def read_current_user(user: User = Depends(get_user)):
    return user


@router.get(
    "/users/{user_id}",
    response_model=UserRead,
)
async def read_user(
    user_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post(
    "/users",
    response_model=UserRead,
)
async def create_user(
    token: Annotated[str, Depends(get_token)],
    user: Annotated[Optional[User], Depends(get_user_or_none)],
    session: Annotated[Session, Depends(get_session)],
):
    if user:
        raise HTTPException(status_code=400, detail="User already exists")

    # If logging in for the first time,
    # retrieve user data via Microsoft Graph API and create user in the database.
    response = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {token}"},
    ).json()

    # Find out the user role based on response.
    admin_emails = session.get(Config, "admin_emails")
    admin_emails = json.loads(admin_emails.value)
    role = "staff"
    if response["jobTitle"] == "Undergraduate":
        role = "student"
    if response["userPrincipalName"] in admin_emails:
        role = "admin"

    # Create a new user and store it in the database.
    user = User(
        email=response["userPrincipalName"],
        name=f"{response['givenName']} {response['surname']}",
        role=role,
    )
    session.add(user)
    session.commit()
    return user


@router.put(
    "/users/{user_id}",
    response_model=UserRead,
    dependencies=[Security(check_admin)],
)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    session: Annotated[Session, Depends(get_session)],
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_data.role not in ["admin", "staff", "student"]:
        raise HTTPException(status_code=400, detail="Invalid user role")

    # Only user role is updatable for consistency.
    user.role = user_data.role
    session.add(user)
    session.commit()
    return user


@router.delete(
    "/users/{user_id}",
    dependencies=[Security(check_admin)],
)
async def delete_user(
    user_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # We use cascade delete to make sure that
    # user's proposals, allocations, shortlists and notifications are also deleted.
    session.delete(user)
    session.commit()
    return {"ok": True}
