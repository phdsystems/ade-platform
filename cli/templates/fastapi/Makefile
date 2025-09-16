.PHONY: help install dev test lint format run docker-build docker-run clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies with uv
	uv venv
	uv pip install -r requirements.txt

dev: ## Install dev dependencies
	uv venv
	uv pip install -e ".[dev]"

test: ## Run tests with pytest
	pytest tests/ -v --cov=src

lint: ## Run linting with ruff
	ruff check src/ tests/
	mypy src/

format: ## Format code with black and ruff
	black src/ tests/
	ruff check --fix src/ tests/

run: ## Run the FastAPI application
	uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

docker-build: ## Build Docker image
	docker build -t {{serviceName}} .

docker-run: ## Run Docker container
	docker run -p 8000:8000 --env-file .env {{serviceName}}

clean: ## Clean up cache and build files
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .ruff_cache .mypy_cache
	rm -rf dist/ build/ *.egg-info/