.PHONY: install dev test lint format type-check migrate docker-up docker-down clean

PYTHON ?= python
PIP ?= pip

install:
	$(PIP) install -e ".[dev]"
	pre-commit install || true

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest --cov=app --cov-report=term-missing -v

lint:
	ruff check app/ tests/
	black --check app/ tests/

format:
	ruff check --fix app/ tests/
	black app/ tests/

type-check:
	mypy app/

migrate:
	alembic upgrade head

migrate-create:
	alembic revision --autogenerate -m "$(msg)"

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v

worker:
	celery -A app.workers.celery_app worker --loglevel=info

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .ruff_cache htmlcov .coverage
