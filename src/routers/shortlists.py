from typing import List
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlmodel import Session, select

from ..models import Project, ProjectRead, Shortlist, User, UserRead
from ..dependencies import (
    block_shortlists_if_shutdown,
    check_staff,
    check_student,
    get_session,
    get_user,
)

router = APIRouter(tags=["shortlist"])


@router.get(
    "/users/me/shortlisted",
    response_model=List[ProjectRead],
    dependencies=[Security(check_student)],
)
async def read_shortlisted(
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    # fmt: off
    shortlists = session.exec(select(Shortlist).where(Shortlist.user_id == user.id)).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference, reverse=True)
    projects = []
    for shortlist in shortlists:
        project = session.get(Project, shortlist.project_id)
        projects.append(project)
    return projects


@router.get(
    "/users/me/shortlisted/{id}",
    response_model=bool,
    dependencies=[Security(check_student)],
)
async def is_shortlisted(
    id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    shortlist = session.get(Shortlist, (user.id, id))
    return bool(shortlist)


@router.post(
    "/users/me/shortlisted/{id}",
    dependencies=[Security(check_student), Security(block_shortlists_if_shutdown)],
)
async def set_shortlisted(
    id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    shortlist = Shortlist(user_id=user.id, project_id=id, preference=0)
    session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.delete(
    "/users/me/shortlisted/{id}",
    dependencies=[Security(check_student), Security(block_shortlists_if_shutdown)],
)
async def unset_shortlisted(
    id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    shortlist = session.get(Shortlist, (user.id, id))
    if not shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    session.delete(shortlist)
    session.commit()
    return {"ok": True}


@router.put(
    "/users/me/shortlisted",
    dependencies=[Security(check_student), Security(block_shortlists_if_shutdown)],
)
async def reorder_shortlisted(
    ids: List[int],
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    for preference, id in enumerate(reversed(ids)):
        shortlist = session.get(Shortlist, (user.id, id))
        # Preference should be 1 to 10
        # 0 is reserved as the default value
        shortlist.preference = preference + 1
        session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.get(
    "/projects/{id}/shortlisters",
    response_model=List[UserRead],
    dependencies=[Security(check_staff)],
)
async def read_shortlisters(
    id: int,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
):
    project = session.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.proposer != user:
        raise HTTPException(status_code=401, detail="Project not owned by user")
    shortlists = session.exec(select(Shortlist).where(Shortlist.project_id == id)).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference, reverse=True)
    users = []
    for shortlist in shortlists:
        user = session.get(User, shortlist.user_id)
        users.append(user)
    return users
