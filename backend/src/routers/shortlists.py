from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Security
from sqlmodel import Session, select

from ..dependencies import (
    block_on_shortlists_shutdown,
    check_staff,
    check_student,
    get_session,
    get_user,
)
from ..models import (
    User,
    UserRead,
    Project,
    ProjectRead,
    Shortlist,
    Config,
)
from ..logger import LoggerRoute

router = APIRouter(tags=["shortlist"], route_class=LoggerRoute)


@router.get(
    "/users/me/shortlisted_projects",
    response_model=list[ProjectRead],
    dependencies=[Security(check_student)],
)
async def read_shortlisted_projects(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    query = select(Shortlist).where(Shortlist.shortlister_id == user.id)
    shortlists = session.exec(query).all()

    # Sort by ascending order of preference
    # because preference of zero has the highest preference.
    shortlists.sort(key=lambda shortlist: shortlist.preference)
    return [shortlist.shortlisted_project for shortlist in shortlists]


@router.post(
    "/users/me/shortlisted_projects",
    dependencies=[Security(check_student), Security(block_on_shortlists_shutdown)],
)
async def shortlist_project(
    project_id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.approved:
        # Cannot shortlist to non approved projects.
        raise HTTPException(status_code=404, detail="Project not approved")

    # Set new shortlist to lowest preference
    query = select(Shortlist).where(Shortlist.shortlister_id == user.id)
    shortlists = session.exec(query).all()

    max_shortlists = session.get(Config, "max_shortlists")
    max_shortlists = int(max_shortlists.value)
    if len(shortlists) >= max_shortlists:
        raise HTTPException(status_code=400, detail=f"Max shortlists reached")

    shortlist = Shortlist(shortlister=user, shortlisted_project=project, preference=len(shortlists))
    session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.delete(
    "/users/me/shortlisted_projects/{project_id}",
    dependencies=[Security(check_student), Security(block_on_shortlists_shutdown)],
)
async def unshortlist_project(
    project_id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    shortlist = session.get(Shortlist, (user.id, project_id))
    if not shortlist:
        raise HTTPException(status_code=404, detail="Shortlist not found")
    session.delete(shortlist)
    session.commit()

    # Recalculate shortlist preferences.
    query = select(Shortlist).where(Shortlist.shortlister_id == user.id)
    shortlists = session.exec(query).all()
    for preference, shortlist in enumerate(shortlists):
        shortlist.preference = preference
        session.add(shortlist)
    session.commit()
    return {"ok": True}


@router.post(
    "/users/me/shortlisted_projects/reorder",
    dependencies=[Security(check_student), Security(block_on_shortlists_shutdown)],
)
async def reorder_shortlisted_projects(
    project_ids: list[str],
    user: Annotated[User, Depends(get_user)],
    session: Annotated[Session, Depends(get_session)],
):
    new_shortlists = []
    for preference, project_id in enumerate(project_ids):
        shortlist = session.get(Shortlist, (user.id, project_id))
        if not shortlist:
            raise HTTPException(status_code=404, detail="Shortlist not found")

        # Make a new shortlist with the new preference.
        # Delete old shortlist to avoid violating the unique constraint on (preference, shortlister_id).
        new_shortlist = Shortlist(
            **shortlist.model_dump(include=["shortlister_id", "shortlisted_project_id"]),
            preference=preference,
        )
        new_shortlists.append(new_shortlist)
        session.delete(shortlist)
    session.commit()

    session.add_all(new_shortlists)
    session.commit()

    return {"ok": True}


@router.get(
    "/projects/{project_id}/shortlisters",
    response_model=list[UserRead],
    dependencies=[Security(check_staff)],
)
async def read_shortlisters(
    project_id: str,
    session: Annotated[Session, Depends(get_session)],
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = select(Shortlist).where(Shortlist.shortlisted_project_id == project_id)
    shortlists = session.exec(query).all()
    shortlists.sort(key=lambda shortlist: shortlist.preference)
    return [shortlist.shortlister for shortlist in shortlists]
