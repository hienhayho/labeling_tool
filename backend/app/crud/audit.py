from datetime import datetime

from fastapi import Request
from sqlalchemy import func
from sqlmodel import Session, select

from app.models import (
    LineItem,
    LineItemAuditLog,
    LineItemMessage,
    LineItemMessageAuditLog,
)


def log_line_item_change(
    *,
    session: Session,
    line_item: LineItem,
    action: str,
    user_id: int | None,
    request: Request | None = None,
    old_values: dict | None = None,
    new_values: dict | None = None,
    additional_data: dict | None = None,
) -> LineItemAuditLog:
    """Log changes to LineItem"""
    audit_log = LineItemAuditLog(
        line_item_id=line_item.id,
        project_id=line_item.project_id,
        user_id=user_id,
        action=action,
        old_status=old_values.get("status") if old_values else None,
        new_status=new_values.get("status") if new_values else None,
        old_feedback=old_values.get("feedback") if old_values else None,
        new_feedback=new_values.get("feedback") if new_values else None,
        old_tools=old_values.get("tools") if old_values else None,
        new_tools=new_values.get("tools") if new_values else None,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent") if request else None,
        additional_data=additional_data,
    )
    session.add(audit_log)
    session.commit()
    return audit_log


def log_line_item_message_change(
    *,
    session: Session,
    line_item_message: LineItemMessage,
    line_item_id: int,
    project_id: int,
    action: str,
    user_id: int | None,
    request: Request | None = None,
    old_values: dict | None = None,
    new_values: dict | None = None,
    additional_data: dict | None = None,
) -> LineItemMessageAuditLog:
    """Log changes to LineItemMessage"""
    audit_log = LineItemMessageAuditLog(
        line_item_message_id=line_item_message.id,
        line_item_id=line_item_id,
        project_id=project_id,
        user_id=user_id,
        action=action,
        old_role=old_values.get("role") if old_values else None,
        new_role=new_values.get("role") if new_values else None,
        old_content=old_values.get("content") if old_values else None,
        new_content=new_values.get("content") if new_values else None,
        old_feedback=old_values.get("feedback") if old_values else None,
        new_feedback=new_values.get("feedback") if new_values else None,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent") if request else None,
        additional_data=additional_data,
    )
    session.add(audit_log)
    session.commit()
    return audit_log


def get_line_item_audit_logs(
    *,
    session: Session,
    project_id: int,
    line_item_id: int | None = None,
    user_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    page: int = 1,
    limit: int = 50,
) -> tuple[list[LineItemAuditLog], int, int]:
    """Get audit logs for LineItem with pagination"""
    # Build query
    statement = select(LineItemAuditLog).where(
        LineItemAuditLog.project_id == project_id
    )

    if line_item_id:
        statement = statement.where(LineItemAuditLog.line_item_id == line_item_id)
    if user_id:
        statement = statement.where(LineItemAuditLog.user_id == user_id)
    if start_date:
        statement = statement.where(LineItemAuditLog.timestamp >= start_date)
    if end_date:
        statement = statement.where(LineItemAuditLog.timestamp <= end_date)

    # Get total count
    count_statement = (
        select(func.count())
        .select_from(LineItemAuditLog)
        .where(LineItemAuditLog.project_id == project_id)
    )
    if line_item_id:
        count_statement = count_statement.where(
            LineItemAuditLog.line_item_id == line_item_id
        )
    if user_id:
        count_statement = count_statement.where(LineItemAuditLog.user_id == user_id)
    if start_date:
        count_statement = count_statement.where(
            LineItemAuditLog.timestamp >= start_date
        )
    if end_date:
        count_statement = count_statement.where(LineItemAuditLog.timestamp <= end_date)

    total_count = session.exec(count_statement).one()

    # Apply pagination
    offset = (page - 1) * limit
    statement = (
        statement.order_by(LineItemAuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )

    logs = session.exec(statement).all()
    total_pages = (total_count + limit - 1) // limit

    return logs, total_count, total_pages


def get_line_item_message_audit_logs(
    *,
    session: Session,
    project_id: int,
    line_item_id: int | None = None,
    line_item_message_id: int | None = None,
    user_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    page: int = 1,
    limit: int = 50,
) -> tuple[list[LineItemMessageAuditLog], int, int]:
    """Get audit logs for LineItemMessage with pagination"""
    # Build query
    statement = select(LineItemMessageAuditLog).where(
        LineItemMessageAuditLog.project_id == project_id
    )

    if line_item_id:
        statement = statement.where(
            LineItemMessageAuditLog.line_item_id == line_item_id
        )
    if line_item_message_id:
        statement = statement.where(
            LineItemMessageAuditLog.line_item_message_id == line_item_message_id
        )
    if user_id:
        statement = statement.where(LineItemMessageAuditLog.user_id == user_id)
    if start_date:
        statement = statement.where(LineItemMessageAuditLog.timestamp >= start_date)
    if end_date:
        statement = statement.where(LineItemMessageAuditLog.timestamp <= end_date)

    # Get total count
    count_statement = (
        select(func.count())
        .select_from(LineItemMessageAuditLog)
        .where(LineItemMessageAuditLog.project_id == project_id)
    )
    if line_item_id:
        count_statement = count_statement.where(
            LineItemMessageAuditLog.line_item_id == line_item_id
        )
    if line_item_message_id:
        count_statement = count_statement.where(
            LineItemMessageAuditLog.line_item_message_id == line_item_message_id
        )
    if user_id:
        count_statement = count_statement.where(
            LineItemMessageAuditLog.user_id == user_id
        )
    if start_date:
        count_statement = count_statement.where(
            LineItemMessageAuditLog.timestamp >= start_date
        )
    if end_date:
        count_statement = count_statement.where(
            LineItemMessageAuditLog.timestamp <= end_date
        )

    total_count = session.exec(count_statement).one()

    # Apply pagination
    offset = (page - 1) * limit
    statement = (
        statement.order_by(LineItemMessageAuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )

    logs = session.exec(statement).all()
    total_pages = (total_count + limit - 1) // limit

    return logs, total_count, total_pages
