import os

from celery import Celery
from dotenv import load_dotenv

load_dotenv()

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
    broker_transport_options={"global_keyprefix": "kb_chatbot_"},
    timezone="UTC",
    enable_utc=True,
)
