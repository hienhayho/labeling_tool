import math
import uuid
from pathlib import Path

from fastapi import HTTPException, Request
from sqlalchemy import case, func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.config import settings
from app.crud.audit import log_line_item_change, log_line_item_message_change
from app.models import (
    LineItem,
    LineItemConfirmRequest,
    LineItemMessage,
    LineItemMessageUpdateRequest,
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

    # Get status counts
    status_counts_stmt = (
        select(LineItem.status, func.count())
        .where(LineItem.project_id == project_id)
        .group_by(LineItem.status)
    )
    if user_id and not is_superuser:
        status_counts_stmt = (
            status_counts_stmt.select_from(LineItem)
            .join(Task, LineItem.id == Task.line_item_id)
            .where(Task.user_id == user_id, Task.project_id == project_id)
        )

    status_counts_result = session.exec(status_counts_stmt).all()

    # Always include all statuses with default = 0
    status_counts = {status.value: 0 for status in LineItemStatus}
    for status, count in status_counts_result:
        status_counts[status.value] = count

    return line_items, total_count, num_pages, status_counts


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


def modify_task_assignment(
    *, session: Session, project_id: int, user_id: int, new_num_samples: int
) -> None:
    # Get current tasks assigned to the user in this project
    current_tasks = session.exec(
        select(Task)
        .where(Task.project_id == project_id)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at)
    ).all()

    current_count = len(current_tasks)

    if new_num_samples == current_count:
        # No change needed
        return

    elif new_num_samples > current_count:
        # Increase: assign more tasks
        # Get all assigned line item IDs in the project
        all_assigned_line_items = session.exec(
            select(Task.line_item_id).where(Task.project_id == project_id)
        ).all()

        # Get all unassigned line items
        unassigned_line_items = session.exec(
            select(LineItem.id)
            .where(LineItem.project_id == project_id)
            .where(LineItem.id.not_in(all_assigned_line_items))
        ).all()

        num_to_add = new_num_samples - current_count

        if len(unassigned_line_items) < num_to_add:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough unassigned line items. Available: {len(unassigned_line_items)}, Requested: {num_to_add}",
            )

        # Assign new tasks
        for line_item_id in unassigned_line_items[:num_to_add]:
            task = Task(
                project_id=project_id,
                user_id=user_id,
                line_item_id=line_item_id,
            )
            session.add(task)
        session.commit()

    else:
        # Decrease: remove tasks (only those with UNLABELED status)
        num_to_remove = current_count - new_num_samples

        # Get tasks with UNLABELED line items, ordered by creation date (newest first)
        unlabeled_tasks = session.exec(
            select(Task)
            .join(LineItem, Task.line_item_id == LineItem.id)
            .where(Task.project_id == project_id)
            .where(Task.user_id == user_id)
            .where(LineItem.status == LineItemStatus.UNLABELED)
            .order_by(Task.created_at.desc())
            .limit(num_to_remove)
        ).all()

        if len(unlabeled_tasks) < num_to_remove:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot remove {num_to_remove} tasks. Only {len(unlabeled_tasks)} tasks have UNLABELED status",
            )

        # Delete the tasks
        for task in unlabeled_tasks:
            session.delete(task)
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
    request: Request | None = None,
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

    # Capture old values for audit logging
    old_values = {
        "status": line_item.status.value if line_item.status else None,
        "feedback": line_item.feedback,
        "tools": line_item.tools,
    }

    # Track if any changes were made
    has_changes = False

    if (
        line_item_confirm_request.tools is not None
        and line_item_confirm_request.tools != line_item.tools
    ):
        line_item.tools = line_item_confirm_request.tools
        has_changes = True

    if (
        line_item_confirm_request.feedback is not None
        and line_item_confirm_request.feedback != line_item.feedback
    ):
        line_item.feedback = line_item_confirm_request.feedback
        has_changes = True

    if line_item_confirm_request.status != line_item.status:
        line_item.status = line_item_confirm_request.status
        has_changes = True

    # Only update and log if there were actual changes
    if has_changes:
        session.add(line_item)
        session.commit()

        # Capture new values for audit logging
        new_values = {
            "status": line_item.status.value if line_item.status else None,
            "feedback": line_item.feedback,
            "tools": line_item.tools,
        }

        # Log the change
        action = (
            "STATUS_CHANGE"
            if old_values["status"] != new_values["status"]
            else "UPDATE"
        )
        log_line_item_change(
            session=session,
            line_item=line_item,
            action=action,
            user_id=user_id,
            request=request,
            old_values=old_values,
            new_values=new_values,
        )

    for line_message_confirm_request in line_item_confirm_request.line_messages:
        line_message = session.exec(
            select(LineItemMessage).where(
                LineItemMessage.id == line_message_confirm_request.id,
                LineItemMessage.line_item_id == line_item_id,
            )
        ).first()
        if not line_message:
            raise HTTPException(status_code=400, detail="Line message not found")

        # Capture old values for audit logging
        old_message_values = {
            "role": line_message.role,
            "content": line_message.content,
            "feedback": line_message.feedback,
        }

        # Track if any changes were made
        has_message_changes = False

        if (
            line_message_confirm_request.feedback
            and line_message_confirm_request.feedback != line_message.feedback
        ):
            line_message.feedback = line_message_confirm_request.feedback
            has_message_changes = True
        if (
            line_message_confirm_request.role
            and line_message_confirm_request.role != line_message.role
        ):
            line_message.role = line_message_confirm_request.role
            has_message_changes = True
        if (
            line_message_confirm_request.content
            and line_message_confirm_request.content != line_message.content
        ):
            line_message.content = line_message_confirm_request.content
            has_message_changes = True

        # Only update and log if there were actual changes
        if has_message_changes:
            session.add(line_message)
            session.commit()

            # Capture new values for audit logging
            new_message_values = {
                "role": line_message.role,
                "content": line_message.content,
                "feedback": line_message.feedback,
            }

            # Log the message change
            log_line_item_message_change(
                session=session,
                line_item_message=line_message,
                line_item_id=line_item_id,
                project_id=project_id,
                action="UPDATE",
                user_id=user_id,
                request=request,
                old_values=old_message_values,
                new_values=new_message_values,
            )


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


def get_projects_dashboard_user(*, session: Session, current_user: User) -> list[dict]:
    # 1. Lấy danh sách các project mà user này đã được assign task
    project_stmt = (
        select(Project)
        .join(Task, Project.id == Task.project_id)
        .where(Task.user_id == current_user.id)
        .distinct()
    )

    projects = session.exec(project_stmt).all()
    project_data = []

    for project in projects:
        # 2. Đếm số task user được assign trong project này
        task_count_stmt = (
            select(func.count())
            .select_from(Task)
            .where(Task.project_id == project.id, Task.user_id == current_user.id)
        )
        task_count = session.exec(task_count_stmt).one()

        # 3. Đếm số lượng theo từng status
        status_stmt = (
            select(LineItem.status, func.count())
            .select_from(LineItem)
            .join(Task, LineItem.id == Task.line_item_id)
            .where(Task.project_id == project.id, Task.user_id == current_user.id)
            .group_by(LineItem.status)
        )
        status_result = session.exec(status_stmt).all()

        # Đảm bảo đủ mọi status (kể cả = 0)
        status_counts = {status.value: 0 for status in LineItemStatus}
        for status, count in status_result:
            status_counts[status.value] = count

        # 4. Gộp dữ liệu
        project_data.append(
            {
                "project_id": project.id,
                "project_name": project.name,
                "project_description": project.description,
                "task_count": task_count,
                "status_counts": status_counts,
            }
        )

    return project_data


def get_project_for_download(
    *,
    session: Session,
    project_id: int,
    limit: int | None = None,
    include_statuses: list[LineItemStatus] | None = None,
) -> list[LineItem]:
    statement = (
        select(LineItem)
        .where(LineItem.project_id == project_id)
        .order_by(LineItem.line_index)
        .options(selectinload(LineItem.line_messages))
    )
    if limit:
        statement = statement.limit(limit)
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


def update_line_item_message(
    *,
    session: Session,
    project_id: int,
    line_item_message_id: int,
    line_item_message_update_request: LineItemMessageUpdateRequest,
    user_id: int | None = None,
    request: Request | None = None,
) -> None:
    line_item_message = session.exec(
        select(LineItemMessage)
        .where(
            LineItemMessage.id == line_item_message_id,
        )
        .join(LineItem, LineItemMessage.line_item_id == LineItem.id)
        .where(LineItem.project_id == project_id)
    ).first()
    if not line_item_message:
        raise HTTPException(status_code=400, detail="Line item message not found")

    # Get the line_item for project_id
    line_item = session.exec(
        select(LineItem).where(LineItem.id == line_item_message.line_item_id)
    ).first()

    # Capture old values for audit logging
    old_values = {
        "role": line_item_message.role,
        "content": line_item_message.content,
        "feedback": line_item_message.feedback,
    }

    # Track if any changes were made
    has_changes = False

    if (
        line_item_message_update_request.role
        and line_item_message_update_request.role != line_item_message.role
    ):
        line_item_message.role = line_item_message_update_request.role
        has_changes = True
    if (
        line_item_message_update_request.content
        and line_item_message_update_request.content != line_item_message.content
    ):
        line_item_message.content = line_item_message_update_request.content
        has_changes = True

    # Only update and log if there were actual changes
    if has_changes:
        session.add(line_item_message)
        session.commit()
        session.refresh(line_item_message)

        # Capture new values for audit logging
        new_values = {
            "role": line_item_message.role,
            "content": line_item_message.content,
            "feedback": line_item_message.feedback,
        }

        # Log the change
        log_line_item_message_change(
            session=session,
            line_item_message=line_item_message,
            line_item_id=line_item_message.line_item_id,
            project_id=line_item.project_id if line_item else project_id,
            action="UPDATE",
            user_id=user_id,
            request=request,
            old_values=old_values,
            new_values=new_values,
        )

    return line_item_message


def delete_user_tasks(*, session: Session, project_id: int, user_id: int) -> int:
    """Delete all tasks with UNLABELED status for a specific user in a project.

    Returns the number of tasks deleted.
    """
    # Get all tasks with UNLABELED line items for this user in this project
    unlabeled_tasks = session.exec(
        select(Task)
        .join(LineItem, Task.line_item_id == LineItem.id)
        .where(Task.project_id == project_id)
        .where(Task.user_id == user_id)
        .where(LineItem.status == LineItemStatus.UNLABELED)
    ).all()

    deleted_count = len(unlabeled_tasks)

    # Delete all the unlabeled tasks
    for task in unlabeled_tasks:
        session.delete(task)

    session.commit()

    return deleted_count
