from typing import List
import requests
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select

from ..config import config
from ..models import User, UserRead, UserUpdate
from ..dependencies import (
    check_admin,
    get_session,
    get_token,
    get_user,
    get_user_or_none,
)

router = APIRouter(tags=["user"])


@router.get("/users", response_model=List[UserRead])
async def read_users(
    role: str | None = None,
    session: Session = Depends(get_session),
):
    if not role:
        return session.exec(select(User)).all()
    return session.exec(select(User).where(User.role == role)).all()


@router.get("/users/me", response_model=UserRead)
async def read_current_user(user: User = Depends(get_user)):
    return user


@router.get("/users/{user_id}", response_model=UserRead)
async def read_user(
    user_id: int,
    session: Session = Depends(get_session),
):
    return session.get(User, user_id)


@router.post("/users", response_model=UserRead)
async def create_user(
    user: User | None = Depends(get_user_or_none),
    token: str = Depends(get_token),
    session: Session = Depends(get_session),
):
    # Return the user if the user exists in the database.
    if user:
        return user
    # If logging in for the first time,
    # retrieve user data via Microsoft Graph API and create user in the database.
    res = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    # Find out the user role based on response.
    role = "staff"
    if res["jobTitle"] == "Undergraduate":
        role = "student"
    if res["userPrincipalName"] in config["users"]["admins"]:
        role = "admin"
    # Create a new user and store it in the database.
    user = User(
        email=res["userPrincipalName"],
        name=f"{res['givenName']} {res['surname']}",
        role=role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.put(
    "/users/{user_id}",
    response_model=UserRead,
    dependencies=[Security(check_admin)],
)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_data.role not in ["admin", "staff", "student"]:
        raise HTTPException(status_code=400, detail="Invalid user role")
    user.role = user_data.role
    session.add(user)
    session.commit()
    return user


@router.delete(
    "/users/{user_id}",
    dependencies=[Security(check_admin)],
)
async def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}
