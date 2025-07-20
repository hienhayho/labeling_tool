from datetime import datetime
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import JSON, Column, Text
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    hashed_password: str
    projects: list["Project"] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: int


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class ProjectBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    url: str = Field(max_length=255, description="Gdrive URL")


class Project(ProjectBase, table=True):
    id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    task_id: str | None = Field(default=None, max_length=255)
    status: str | None = Field(default=None, max_length=255)
    owner_id: int = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    owner: User = Relationship(back_populates="projects")
    line_items: list["LineItem"] = Relationship(
        back_populates="project", cascade_delete=True
    )
    tasks: list["Task"] = Relationship(back_populates="project", cascade_delete=True)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore
    description: str | None = Field(default=None, max_length=255)
    url: str | None = Field(default=None, max_length=255)


class ProjectPublic(ProjectBase):
    id: int
    owner_id: int


class ProjectsPublic(SQLModel):
    data: list[ProjectPublic]
    count: int


class ProjectStatus(SQLModel):
    state: str
    info: dict | None = None
    name: str | None = None
    description: str | None = None
    num_samples: int | None = None
    num_task_assigned: int | None = None
    num_task_not_assigned: int | None = None
    user_task_summary: list[dict] | None = None


class LineItemStatus(str, Enum):
    UNLABELED = "UNLABELED"
    CONFIRMED = "CONFIRMED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class LineItemBase(SQLModel):
    tools: list[dict] = Field(sa_column=Column(JSON), default=[])


class LineItem(LineItemBase, table=True):
    __tablename__ = "line_item"
    id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    project_id: int = Field(
        foreign_key="project.id", nullable=False, ondelete="CASCADE"
    )
    line_index: int = Field(nullable=False)
    feedback: str | None = Field(default=None, max_length=255)
    project: Project = Relationship(back_populates="line_items")
    status: LineItemStatus = Field(
        default=LineItemStatus.UNLABELED,
        sa_column=Column(SQLAlchemyEnum(LineItemStatus)),
    )
    line_messages: list["LineItemMessage"] = Relationship(
        back_populates="line_item",
        cascade_delete=True,
        sa_relationship_kwargs={
            "order_by": "LineItemMessage.line_message_index",
            "lazy": "selectin",
        },
    )
    tasks: list["Task"] = Relationship(back_populates="line_item")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class LineItemMessageBase(SQLModel):
    line_message_index: int = Field(nullable=False)
    role: str = Field(nullable=False)
    content: str = Field(sa_column=Column(Text))


class LineItemMessageRead(LineItemMessageBase):
    id: int
    feedback: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LineItemRead(LineItemBase):
    id: int
    project_id: int
    line_index: int
    feedback: str | None
    line_messages: list[LineItemMessageRead] = []
    created_at: datetime
    updated_at: datetime
    status: LineItemStatus

    class Config:
        from_attributes = True


class LineItemsPublic(SQLModel):
    data: list[LineItemRead]
    total_count: int
    num_pages: int
    status_counts: dict[LineItemStatus, int]


class LineItemMessageConfirmRequest(SQLModel):
    id: int
    role: str
    content: str
    feedback: str | None = None


class LineItemConfirmRequest(SQLModel):
    line_messages: list[LineItemMessageConfirmRequest]
    tools: list[dict] | None = None
    feedback: str | None = None
    status: LineItemStatus = LineItemStatus.CONFIRMED


class LineItemMessage(LineItemMessageBase, table=True):
    __tablename__ = "line_item_message"
    id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    line_item_id: int = Field(
        foreign_key="line_item.id", nullable=False, ondelete="CASCADE"
    )
    feedback: str | None = Field(default=None, max_length=255)
    line_item: LineItem = Relationship(back_populates="line_messages")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class AssignTaskRequest(SQLModel):
    user_id: int
    num_samples: int


class Task(SQLModel, table=True):
    __tablename__ = "task"
    id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    project_id: int = Field(
        foreign_key="project.id", nullable=False, ondelete="CASCADE"
    )
    user_id: int = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    line_item_id: int = Field(
        foreign_key="line_item.id", nullable=False, ondelete="CASCADE"
    )
    user: User = Relationship(back_populates="tasks")
    line_item: LineItem = Relationship(back_populates="tasks")
    project: Project = Relationship(back_populates="tasks")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ProjectDownloadRequest(SQLModel):
    limit: int | None = None
    include_statuses: list[LineItemStatus]
    file_name: str

    class Config:
        from_attributes = True
