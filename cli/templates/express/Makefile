.PHONY: help install dev test lint format run docker-build docker-run clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies with pnpm
	pnpm install

dev: ## Run in development mode with hot reload
	pnpm run dev

test: ## Run tests
	pnpm test

lint: ## Run ESLint
	pnpm eslint src/

format: ## Format code with Prettier
	pnpm prettier --write "src/**/*.{js,mjs,json}"

run: ## Run the Express application
	pnpm start

docker-build: ## Build Docker image
	docker build -t {{serviceName}} .

docker-run: ## Run Docker container
	docker run -p {{port}}:{{port}} --env-file .env {{serviceName}}

clean: ## Clean up node_modules and cache
	rm -rf node_modules/
	rm -rf .pnpm-store/
	rm -f pnpm-lock.yaml