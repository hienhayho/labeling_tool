# Conversational Labeling Tool

## Dev

```bash
pre-commit install

make database_up

cp .env.example .env
```

## Backend

```bash
cd backend && uv sync

uv run fastapi run --reload app/main.py
```

## Celery

```bash
cd backend/

uv run celery -A app.celery_app worker --loglevel=info
```

## Frontend

```bash
cp .env.example ./frontend/.env

cd frontend/

pnpm build && pnpm start
```
