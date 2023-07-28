from typing import List
import requests
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..models import User, UserRead
from ..dependencies import get_session, get_token, get_user, get_user_or_none

router = APIRouter(tags=["user"])


@router.get("/users", response_model=List[UserRead])
async def read_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()


@router.get("/users/me", response_model=UserRead)
async def read_current_user(user: User = Depends(get_user)):
    return user


@router.get("/users/{id}", response_model=UserRead)
async def read_user(id: int, session: Session = Depends(get_session)):
    return session.get(User, id)


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
    user = User(
        email=res["userPrincipalName"],
        name=f"{res['givenName']} {res['surname']}",
        role="student" if res["jobTitle"] == "Undergraduate" else "staff",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
