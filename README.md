# Conversational Labeling Tool

## Quickstart

**Run:**

```bash
chmod +x start-production.sh

bash start-production.sh
```

You can now access `frontend` at [http://localhost](http://localhost). `Traefik` at [http://localhost:8000](http://localhost:8000)

**(Optional)** Modify `DOMAIN`, `BACKEND_CORS_ORIGINS`, `NEXT_PUBLIC_API_URL` to your domain in [.env.production](./.env.production).

## Dev

```bash
pre-commit install

make database_up

cp .env.example .env
```

## Backend

```bash
cd backend && uv sync

uv run alembic upgrade head

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

pnpm i --frozen-lockfile

pnpm build && pnpm start
```
