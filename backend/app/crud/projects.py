import math
import uuid
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import case, func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.config import settings
from app.models import (
    LineItem,
    LineItemConfirmRequest,
    LineItemMessage,
    LineItemStatus,
    Project,
    ProjectCreate,
    Task,
    User,
)
from app.tasks.extract_data import extract_data


def get_projects(*, session: Session, current_user: User) -> list[Project]:
    if current_user.is_superuser:
        statement = select(Project)
    else:
        statement = (
            select(Project)
            .join(Task, Project.id == Task.project_id)
            .where(Task.user_id == current_user.id)
            .group_by(Project.id)
        )
    return session.exec(statement).all()


def get_project_by_id(*, session: Session, project_id: int) -> Project | None:
    statement = (
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.line_items))
    )
    return session.exec(statement).first()


def get_line_items(
    *,
    session: Session,
    project_id: int,
    page: int = 1,
    limit: int = 10,
    status: LineItemStatus | None = None,
    user_id: int | None = None,
    is_superuser: bool = False,
) -> tuple[list[LineItem], int, int]:
    # Get total count of line items
    total_statement = (
        select(func.count())
        .select_from(LineItem)
        .where(LineItem.project_id == project_id)
    )
    if status:
        total_statement = total_statement.where(LineItem.status == status)
    if user_id and not is_superuser:
        total_statement = total_statement.join(
            Task, LineItem.id == Task.line_item_id
        ).where(Task.user_id == user_id, Task.project_id == project_id)

    total_count = session.exec(total_statement).one()

    # Get line items
    offset = (page - 1) * limit
    statement = select(LineItem).where(LineItem.project_id == project_id)
    if status:
        statement = statement.where(LineItem.status == status)
    if user_id and not is_superuser:
        statement = (
            statement.select_from(LineItem)
            .join(Task, LineItem.id == Task.line_item_id)
            .where(Task.user_id == user_id, Task.project_id == project_id)
        )

    statement = statement.offset(offset).limit(limit)
    line_items = session.exec(statement).all()
    num_pages = math.ceil(total_count / limit)

    return line_items, total_count, num_pages


def create_project(
    *, session: Session, project_in: ProjectCreate, current_user: User
) -> Project:
    file_path = str(Path(settings.TEMP_DOWNLOAD_FOLDER) / f"{uuid.uuid4()}.jsonl")
    db_project = Project(
        name=project_in.name,
        description=project_in.description,
        url=project_in.url,
        owner_id=current_user.id,
    )
    session.add(db_project)
    session.commit()
    session.refresh(db_project)

    task = extract_data.delay(
        project_in.url,
        file_path,
        db_project.id,
    )

    db_project.task_id = task.id
    db_project.status = "processing"
    session.add(db_project)
    session.commit()
    session.refresh(db_project)

    return db_project


def get_line_item_by_index(
    *, session: Session, project_id: int, line_index: int
) -> LineItem | None:
    statement = (
        select(LineItem)
        .where(LineItem.project_id == project_id, LineItem.line_index == line_index)
        .options(selectinload(LineItem.line_messages))
    )
    return session.exec(statement).first()


def assign_task(
    *, session: Session, project_id: int, user_id: int, num_samples: int
) -> None:
    # First, get all line items are assigned to the user
    assigned_line_items = session.exec(
        select(Task.line_item_id).where(Task.project_id == project_id)
    ).all()
    line_items_ids = session.exec(
        select(LineItem.id).where(LineItem.project_id == project_id)
    ).all()
    line_items_ids = [
        line_item_id
        for line_item_id in line_items_ids
        if line_item_id not in assigned_line_items
    ]
    if len(line_items_ids) < num_samples:
        raise HTTPException(status_code=400, detail="Not enough line items to assign")

    # Then, assign the tasks
    for line_item_id in line_items_ids[:num_samples]:
        task = Task(
            project_id=project_id,
            user_id=user_id,
            line_item_id=line_item_id,
        )
        session.add(task)
        session.commit()


def get_user_task_summary_in_project(
    *, session: Session, project_id: int
) -> list[dict]:
    statement = (
        select(
            User.id, User.full_name, User.email, func.count(Task.id).label("task_count")
        )
        .join(Task, Task.user_id == User.id)
        .where(Task.project_id == project_id)
        .group_by(User.id, User.full_name, User.email)
        .order_by(func.count(Task.id).desc())
    )
    results = session.exec(statement).all()

    return [
        {
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "task_count": task_count,
        }
        for user_id, full_name, email, task_count in results
    ]


def confirm_line_item(
    *,
    session: Session,
    user_id: int,
    is_superuser: bool,
    project_id: int,
    line_item_id: int,
    line_item_confirm_request: LineItemConfirmRequest,
) -> None:
    line_item = session.exec(
        select(LineItem).where(
            LineItem.id == line_item_id, LineItem.project_id == project_id
        )
    ).first()
    task = session.exec(
        select(Task).where(
            Task.line_item_id == line_item_id,
            Task.user_id == user_id,
            Task.project_id == project_id,
        )
    ).first()
    if not is_superuser and not task:
        raise HTTPException(status_code=400, detail="Task not found")

    if not line_item:
        raise HTTPException(status_code=400, detail="Line item not found")

    if line_item_confirm_request.tools:
        line_item.tools = line_item_confirm_request.tools

    if line_item_confirm_request.feedback:
        line_item.feedback = line_item_confirm_request.feedback
    line_item.status = line_item_confirm_request.status
    session.add(line_item)
    session.commit()

    for line_message_confirm_request in line_item_confirm_request.line_messages:
        line_message = session.exec(
            select(LineItemMessage).where(
                LineItemMessage.id == line_message_confirm_request.id,
                LineItemMessage.line_item_id == line_item_id,
            )
        ).first()
        if not line_message:
            raise HTTPException(status_code=400, detail="Line message not found")

        if line_message_confirm_request.feedback:
            line_message.feedback = line_message_confirm_request.feedback
        if line_message_confirm_request.role:
            line_message.role = line_message_confirm_request.role
        if line_message_confirm_request.content:
            line_message.content = line_message_confirm_request.content
        session.add(line_message)
        session.commit()


def get_projects_dashboard(*, session: Session) -> list[dict]:
    # 1. Get all projects
    project_stmt = select(Project)
    projects = session.exec(project_stmt).all()
    project_data = []

    for project in projects:
        # 2. Count total samples (line_items)
        num_samples_stmt = select(func.count()).where(LineItem.project_id == project.id)
        num_samples = session.exec(num_samples_stmt).one()

        # 3. Get all tasks by project with user info + count by status
        status_counts_stmt = (
            select(
                User.id.label("user_id"),
                User.full_name,
                User.email,
                func.count(Task.id).label("task_count"),
                func.sum(
                    case((LineItem.status == LineItemStatus.CONFIRMED, 1), else_=0)
                ).label("confirmed"),
                func.sum(
                    case((LineItem.status == LineItemStatus.UNLABELED, 1), else_=0)
                ).label("unlabeled"),
                func.sum(
                    case((LineItem.status == LineItemStatus.APPROVED, 1), else_=0)
                ).label("approved"),
                func.sum(
                    case((LineItem.status == LineItemStatus.REJECTED, 1), else_=0)
                ).label("rejected"),
            )
            .join(Task, Task.user_id == User.id)
            .join(LineItem, LineItem.id == Task.line_item_id)
            .where(Task.project_id == project.id)
            .group_by(User.id, User.full_name, User.email)
        )

        user_summaries = session.exec(status_counts_stmt).all()
        user_task_summary = []
        for row in user_summaries:
            user_task_summary.append(
                {
                    "user_id": row.user_id,
                    "full_name": row.full_name,
                    "email": row.email,
                    "task_count": row.task_count,
                    "confirmed": row.confirmed,
                    "unlabeled": row.unlabeled,
                    "approved": row.approved,
                    "rejected": row.rejected,
                }
            )

        # 4. Merge all data
        project_data.append(
            {
                "project_id": project.id,
                "project_name": project.name,
                "project_description": project.description,
                "num_samples": num_samples,
                "user_task_summary": user_task_summary,
            }
        )

    return project_data


def get_project_for_download(
    *,
    session: Session,
    project_id: int,
    limit: int,
    include_statuses: list[LineItemStatus],
) -> list[LineItem]:
    statement = (
        select(LineItem)
        .where(LineItem.project_id == project_id)
        .order_by(LineItem.line_index)
        .limit(limit)
        .options(selectinload(LineItem.line_messages))
    )
    if include_statuses:
        statement = statement.where(LineItem.status.in_(include_statuses))
    line_items = session.exec(statement).all()
    results = []
    for line_item in line_items:
        results.append(
            {
                "tools": line_item.tools,
                "messages": [
                    {
                        "role": message.role,
                        "content": message.content,
                    }
                    for message in line_item.line_messages
                ],
            }
        )
    return results
