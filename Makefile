.PHONY: help build up down restart logs clean dev dev-down prod-build prod-up prod-down health

# Default target
help:
	@echo "Super Carer App - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod-build   - Build production images"
	@echo "  make prod-up      - Start production environment"
	@echo "  make prod-down    - Stop production environment"
	@echo "  make prod-logs    - View production logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make restart      - Restart all services"
	@echo "  make health       - Check service health"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make rebuild      - Rebuild without cache"

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-rebuild:
	@echo "🔨 Rebuilding development environment..."
	docker-compose -f docker-compose.dev.yml up --build

# Production commands
prod-build:
	@echo "🔨 Building production images..."
	docker-compose build --no-cache

prod-up:
	@echo "🚀 Starting production environment..."
	docker-compose up -d
	@echo "✅ Services started!"
	@make health

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose down

prod-logs:
	docker-compose logs -f

prod-restart:
	@echo "🔄 Restarting production services..."
	docker-compose restart

# Maintenance commands
restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart

health:
	@echo "🏥 Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "App health:"
	@curl -f http://localhost:3000/api/health || echo "❌ App is not healthy"

clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "✅ Cleanup complete!"

rebuild:
	@echo "🔨 Rebuilding without cache..."
	docker-compose build --no-cache
	docker-compose up -d

# Utility commands
shell:
	@echo "🐚 Opening shell in app container..."
	docker-compose exec app sh

shell-dev:
	@echo "🐚 Opening shell in dev container..."
	docker-compose -f docker-compose.dev.yml exec app-dev sh

stats:
	@echo "📊 Container statistics..."
	docker stats --no-stream

backup-redis:
	@echo "💾 Backing up Redis data..."
	@mkdir -p ./backup
	docker-compose exec redis redis-cli BGSAVE
	docker cp super-carer-redis:/data/dump.rdb ./backup/redis-$(shell date +%Y%m%d-%H%M%S).rdb
	@echo "✅ Backup complete!"

# Environment setup
setup:
	@echo "⚙️  Setting up environment..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env file from .env.example"; \
		echo "⚠️  Please edit .env with your configuration"; \
	else \
		echo "ℹ️  .env file already exists"; \
	fi
