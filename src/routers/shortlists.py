from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..models import Project, ProjectRead, Shortlist, User, UserRead
from ..dependencies import get_session

router = APIRouter(tags=["shortlist"])


@router.get("/users/me/shortlisted", response_model=List[ProjectRead])
async def read_shortlisted(session: Session = Depends(get_session)):
    # TODO: Read from session
    user_id = 1
    # fmt: off
    shortlists = session.exec(select(Shortlist).where(Shortlist.user_id == user_id)).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference)
    projects = []
    for shortlist in shortlists:
        project = session.get(Project, shortlist.project_id)
        projects.append(project)
    return projects


@router.post("/users/me/shortlisted")
async def create_shortlisted(
    project_id: int,
    preference: int,
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 1
    shortlist = Shortlist(user_id=user_id, project_id=project_id, preference=preference)
    session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.delete("/users/me/shortlisted/{project_id}")
async def delete_shortlisted(
    project_id: int,
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 1
    shortlist = session.get(Shortlist, (user_id, project_id))
    if not shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    session.delete(shortlist)
    session.commit()
    return {"ok": True}


@router.put("/users/me/shortlisted")
async def reorder_shortlisted(
    preferences: List[int],
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 1
    # fmt: off
    shortlists = session.exec(select(Shortlist).where(Shortlist.user_id == user_id)).all()
    if len(preferences) != len(shortlists):
        raise HTTPException(status_code=400, detail="Invalid shortlist preferences")
    for shortlist, preference in zip(shortlists, preferences):
        shortlist.preference = preference
        session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.get("/projects/{project_id}/shortlisters", response_model=List[UserRead])
async def read_shortlisters(project_id: int, session: Session = Depends(get_session)):
    shortlists = session.exec(
        select(Shortlist).where(Shortlist.project_id == project_id)
    ).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference)
    users = []
    for shortlist in shortlists:
        user = session.get(User, shortlist.user_id)
        users.append(user)
    return users
