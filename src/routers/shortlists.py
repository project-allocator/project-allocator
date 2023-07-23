from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..models import Project, ProjectRead, Shortlist, User, UserRead
from ..dependencies import get_session

router = APIRouter(tags=["shortlist"])


@router.get("/users/me/shortlisted", response_model=List[ProjectRead])
async def read_shortlisted(session: Session = Depends(get_session)):
    # TODO: Read from session
    user_id = 11
    # fmt: off
    shortlists = session.exec(select(Shortlist).where(Shortlist.user_id == user_id)).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference, reverse=True)
    projects = []
    for shortlist in shortlists:
        project = session.get(Project, shortlist.project_id)
        projects.append(project)
    return projects


@router.get("/users/me/shortlisted/{id}", response_model=bool)
async def is_shortlisted(
    id: int,
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 11
    shortlist = session.get(Shortlist, (user_id, id))
    return bool(shortlist)


@router.post("/users/me/shortlisted/{id}")
async def set_shortlisted(
    id: int,
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 11
    shortlist = Shortlist(user_id=user_id, project_id=id, preference=0)
    session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.delete("/users/me/shortlisted/{id}")
async def unset_shortlisted(
    id: int,
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 11
    shortlist = session.get(Shortlist, (user_id, id))
    if not shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    session.delete(shortlist)
    session.commit()
    return {"ok": True}


@router.put("/users/me/shortlisted")
async def reorder_shortlisted(
    ids: List[int],
    session: Session = Depends(get_session),
):
    # TODO: Read from session
    user_id = 11
    for preference, id in enumerate(reversed(ids)):
        shortlist = session.get(Shortlist, (user_id, id))
        # Preference should be 1 to 10
        # 0 is reserved as the default value
        shortlist.preference = preference + 1
        session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.get("/projects/{id}/shortlisters", response_model=List[UserRead])
async def read_shortlisters(id: int, session: Session = Depends(get_session)):
    shortlists = session.exec(select(Shortlist).where(Shortlist.project_id == id)).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference, reverse=True)
    users = []
    for shortlist in shortlists:
        user = session.get(User, shortlist.user_id)
        users.append(user)
    return users
