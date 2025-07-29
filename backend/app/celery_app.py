import os
from pathlib import Path

from celery import Celery
from dotenv import load_dotenv
from loguru import logger

from app.core.config import settings

load_dotenv()


Path(settings.TEMP_DOWNLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
logger.info(f"Created temp download folder: {settings.TEMP_DOWNLOAD_FOLDER}")

celery_app = Celery(
    "labelling_tools",
    backend=os.getenv("CELERY_BACKEND"),
    broker=os.getenv("CELERY_BROKER_URL"),
    include=["app.tasks.extract_data"],
)

celery_app.conf.update(
    result_backend=os.getenv("CELERY_BROKER_URL"),
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    broker_transport_options={"global_keyprefix": "labelling_tool_"},
    timezone="UTC",
    enable_utc=True,
)
