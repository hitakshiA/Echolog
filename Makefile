.PHONY: run-backend run-frontend test-backend test-frontend lint migrate

# Run backend dev server
run-backend:
	cd backend && source .venv/bin/activate && flask run --debug

# Run frontend dev server
run-frontend:
	cd frontend && npm run dev

# Run all backend tests
test-backend:
	cd backend && source .venv/bin/activate && pytest -v

# Run all frontend tests
test-frontend:
	cd frontend && npx vitest run

# Run all tests
test: test-backend test-frontend

# Lint backend
lint-backend:
	cd backend && source .venv/bin/activate && ruff check . --fix && ruff format .

# Lint frontend
lint-frontend:
	cd frontend && npx eslint .

# Lint all
lint: lint-backend lint-frontend

# Run database migrations
migrate:
	cd backend && source .venv/bin/activate && flask db upgrade

# Create a new migration
migration:
	cd backend && source .venv/bin/activate && flask db migrate -m "$(msg)"

# Docker dev environment
docker-up:
	docker compose up --build

docker-down:
	docker compose down

# Backend coverage
coverage-backend:
	cd backend && source .venv/bin/activate && pytest --cov=app --cov-report=term-missing

# Install all dependencies
install:
	cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"
	cd frontend && npm install
