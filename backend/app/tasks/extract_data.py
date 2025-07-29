from pathlib import Path

from celery import Task
from loguru import logger

from app.api.deps import get_db_context
from app.celery_app import celery_app
from app.models import LineItem, LineItemMessage, Project
from app.utils import download_file_from_gdrive, extract_data_from_jsonl


@celery_app.task(bind=True)
def extract_data(self: Task, url: str, file_path: str, project_id: int) -> None:
    self.update_state(
        state="PROGRESS",
        meta={"type": "downloading", "content": "Downloading file from Google Drive"},
    )

    logger.info(f"Downloading file from {url} to {file_path}...")
    download_file_from_gdrive(url, file_path)

    self.update_state(
        state="PROGRESS",
        meta={"type": "extracting", "content": "Starting extraction process ..."},
    )

    logger.info(f"Extracting data from {file_path}...")
    with get_db_context() as session:
        current = 0

        for item_base, line_messages, total in extract_data_from_jsonl(file_path):
            current += 1
            db_line_item = LineItem(
                project_id=project_id,
                tools=item_base.tools,
                line_index=current,
            )
            session.add(db_line_item)
            session.commit()
            session.refresh(db_line_item)

            for line_message in line_messages:
                db_line_message = LineItemMessage(
                    line_item_id=db_line_item.id,
                    role=line_message.role,
                    content=line_message.content,
                    line_message_index=line_message.line_message_index,
                )
                session.add(db_line_message)
                session.commit()
                session.refresh(db_line_message)

            self.update_state(
                state="PROGRESS",
                meta={
                    "type": "extracting",
                    "content": f"{current / total * 100:.2f}% - {current}/{total}",
                },
            )
        db_project = session.get(Project, project_id)
        db_project.status = "completed"
        session.add(db_project)
        session.commit()
        session.refresh(db_project)

    logger.info(f"Deleting file {file_path}...")
    Path(file_path).unlink(missing_ok=True)

    self.update_state(
        state="SUCCESS",
        meta={"type": "completed", "content": "Extraction process completed"},
    )
