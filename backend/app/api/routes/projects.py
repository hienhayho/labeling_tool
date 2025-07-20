from pathlib import Path

import polars as pl
from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from loguru import logger

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.celery_app import celery_app
from app.core.config import settings
from app.crud.projects import (
    assign_task,
    confirm_line_item,
    create_project,
    get_line_item_by_index,
    get_line_items,
    get_project_by_id,
    get_project_for_download,
    get_projects,
    get_projects_dashboard,
    get_projects_dashboard_user,
    get_user_task_summary_in_project,
)
from app.models import (
    AssignTaskRequest,
    LineItemConfirmRequest,
    LineItemRead,
    LineItemsPublic,
    LineItemStatus,
    ProjectCreate,
    ProjectDownloadRequest,
    ProjectPublic,
    ProjectStatus,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get(
    "/",
    response_model=list[ProjectPublic],
)
def get_own_projects(session: SessionDep, current_user: CurrentUser):
    return get_projects(session=session, current_user=current_user)


@router.post(
    "/",
    response_model=ProjectPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def create_project_route(
    session: SessionDep, current_user: CurrentUser, project: ProjectCreate
):
    try:
        return create_project(
            session=session,
            project_in=project,
            current_user=current_user,
        )
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/status", response_model=ProjectStatus)
def get_project_status(project_id: int, session: SessionDep):
    project = get_project_by_id(session=session, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task_id = project.task_id
    task = AsyncResult(task_id, app=celery_app)

    state = task.state
    info = task.info
    num_samples = len(project.line_items)
    num_task_assigned = len(project.tasks)
    num_task_not_assigned = num_samples - num_task_assigned
    user_task_summary = get_user_task_summary_in_project(
        session=session, project_id=project_id
    )

    return ProjectStatus(
        state=state,
        info=info,
        name=project.name,
        description=project.description,
        num_samples=num_samples,
        num_task_assigned=num_task_assigned,
        num_task_not_assigned=num_task_not_assigned,
        user_task_summary=user_task_summary,
    )


@router.get("/{project_id}/samples/{sample_idx}", response_model=LineItemRead)
def get_line_item_by_index_route(project_id: int, sample_idx: int, session: SessionDep):
    line_item = get_line_item_by_index(
        session=session, project_id=project_id, line_index=sample_idx
    )
    if not line_item:
        raise HTTPException(status_code=404, detail="Line item not found")

    return line_item


@router.delete("/{project_id}")
def delete_project(project_id: int, session: SessionDep):
    project = get_project_by_id(session=session, project_id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    session.delete(project)
    session.commit()

    return {"message": "Project deleted successfully"}


@router.get("/{project_id}/samples", response_model=LineItemsPublic)
def get_line_items_route(
    project_id: int,
    session: SessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, description="Number of items per page"),
    status: LineItemStatus | None = None,
):
    line_items, total_count, num_pages, status_counts = get_line_items(
        session=session,
        project_id=project_id,
        page=page,
        limit=limit,
        status=status,
        user_id=current_user.id,
        is_superuser=current_user.is_superuser,
    )
    return LineItemsPublic(
        data=line_items,
        total_count=total_count,
        num_pages=num_pages,
        status_counts=status_counts,
    )


@router.post(
    "/{project_id}/assign",
    dependencies=[Depends(get_current_active_superuser)],
)
def assign_task_route(
    project_id: int,
    assign_task_request: AssignTaskRequest,
    session: SessionDep,
):
    assign_task(
        project_id=project_id,
        user_id=assign_task_request.user_id,
        num_samples=assign_task_request.num_samples,
        session=session,
    )
    return {"message": "Task assigned successfully"}


@router.post("/{project_id}/confirm/{line_item_id}")
def confirm_line_item_message_route(
    project_id: int,
    line_item_id: int,
    line_item_confirm_request: LineItemConfirmRequest,
    session: SessionDep,
    current_user: CurrentUser,
):
    confirm_line_item(
        session=session,
        user_id=current_user.id,
        is_superuser=current_user.is_superuser,
        project_id=project_id,
        line_item_id=line_item_id,
        line_item_confirm_request=line_item_confirm_request,
    )
    return {"message": "Line item confirmed successfully"}


@router.get("/dashboard", dependencies=[Depends(get_current_active_superuser)])
def get_dashboard_admin(session: SessionDep):
    return get_projects_dashboard(session=session)


@router.get("/dashboard_user")
def get_dashboard_user(session: SessionDep, current_user: CurrentUser):
    return get_projects_dashboard_user(session=session, current_user=current_user)


@router.post(
    "/{project_id}/download",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=FileResponse,
)
def download_project(
    project_id: int,
    session: SessionDep,
    project_download_request: ProjectDownloadRequest,
):
    results = get_project_for_download(
        session=session,
        project_id=project_id,
        limit=project_download_request.limit,
        include_statuses=project_download_request.include_statuses,
    )
    pl.DataFrame(results).write_ndjson(
        Path(settings.TEMP_DOWNLOAD_FOLDER)
        / f"{project_download_request.file_name}.jsonl"
    )
    return FileResponse(
        Path(settings.TEMP_DOWNLOAD_FOLDER)
        / f"{project_download_request.file_name}.jsonl",
        filename=f"{project_download_request.file_name}.jsonl",
    )
