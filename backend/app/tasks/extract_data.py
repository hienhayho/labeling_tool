from pathlib import Path

from celery import Task
from loguru import logger

from app.api.deps import get_db_context
from app.celery_app import celery_app
from app.models import LineItem, LineItemMessage, Project
from app.utils import download_file_from_gdrive, extract_data_from_jsonl


@celery_app.task(bind=True)
def extract_data(self: Task, url: str, file_path: str, project_id: int) -> None:
    with get_db_context() as session:
        db_project = session.get(Project, project_id)

        # Download file
        info = {
            "type": "downloading",
            "content": "Downloading file from Google Drive",
        }
        db_project.status = "PROGRESS"
        db_project.info = info
        session.add(db_project)
        session.commit()
        session.refresh(db_project)

        self.update_state(
            state="PROGRESS",
            meta=info,
        )

        logger.info(f"Downloading file from {url} to {file_path}...")
        download_file_from_gdrive(url, file_path)

        # Extract data
        info = {
            "type": "extracting",
            "content": "Starting extraction process ...",
        }
        db_project.status = "PROGRESS"
        db_project.info = info
        session.add(db_project)
        session.commit()
        session.refresh(db_project)

        self.update_state(
            state="PROGRESS",
            meta=info,
        )

        logger.info(f"Extracting data from {file_path}...")

        current = 0

        # Save data to the database
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

            info = {
                "type": "extracting",
                "content": f"{current / total * 100:.2f}% - {current}/{total}",
            }
            db_project.info = info
            session.add(db_project)
            session.commit()
            session.refresh(db_project)

            self.update_state(
                state="PROGRESS",
                meta=info,
            )

        # Update project status
        db_project.status = "SUCCESS"
        db_project.info = {
            "type": "completed",
            "content": "Extraction process completed",
        }
        session.add(db_project)
        session.commit()
        session.refresh(db_project)

    # Delete file
    logger.info(f"Deleting file {file_path}...")
    Path(file_path).unlink(missing_ok=True)

    self.update_state(
        state="SUCCESS",
        meta=db_project.info,
    )
