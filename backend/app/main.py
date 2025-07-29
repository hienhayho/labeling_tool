import asyncio
from datetime import datetime
from pathlib import Path

import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from loguru import logger
from sqlmodel import Session
from starlette.middleware.cors import CORSMiddleware

from app.api.deps import get_db
from app.api.main import api_router
from app.core.config import settings
from app.core.db import init_db


async def delete_old_files(file_interval: int, clean_interval: int, folder: str):
    """
    Delete old files in the specified folder

    Args:
        file_interval (int): File interval in minutes
        clean_interval (int): Clean interval in minutes
        folder (str): Folder to clean up
    """

    while True:
        logger.warning("Cleaning up download folder ...")

        interval = file_interval * 60
        current_time = datetime.now()

        for file in Path(folder).iterdir():
            try:
                if file.is_file():
                    file_mod_time = datetime.fromtimestamp(file.stat().st_mtime)
                    age = (current_time - file_mod_time).total_seconds()

                    if age > interval:
                        file.unlink()
                        logger.warning(f"Deleted file: {file}")
                    else:
                        logger.info(f"Skipping file: {file}")
            except Exception as e:
                logger.error(f"Error deleting file {file}: {e}")

        await asyncio.sleep(clean_interval * 60)


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


def get_db_session() -> Session:
    session = get_db()
    return next(session)


async def lifespan(app: FastAPI):  # noqa: ARG001
    logger.info("Starting up...")
    session = get_db_session()
    Path(settings.TEMP_DOWNLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
    await init_db(session)
    logger.info("Database initialized")
    asyncio.create_task(delete_old_files(60, 1, settings.TEMP_DOWNLOAD_FOLDER))
    yield


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
