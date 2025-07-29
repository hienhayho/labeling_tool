from loguru import logger
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.crud import users
from app.models import User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
async_engine = create_async_engine(str(settings.SQLALCHEMY_DATABASE_URI_ASYNC))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


async def create_db_and_tables() -> None:
    """Create all database tables from SQLModel definitions"""
    try:
        # Import all models to ensure they're registered

        # Create all tables
        async with async_engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)

        logger.info("✅ Database tables created successfully from SQLModel definitions")
    except Exception as e:
        logger.error(f"❌ Failed to create database tables: {e}")
        raise


async def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    try:
        statement = select(User).limit(1)
        result = await session.exec(statement)  # noqa: F841

    except Exception:
        # If table doesn't exist, create all tables
        logger.info(
            "Database tables don't exist. Creating from SQLModel definitions..."
        )
        await create_db_and_tables()
        logger.info("Database tables created successfully")

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = users.create_user(session=session, user_create=user_in)
