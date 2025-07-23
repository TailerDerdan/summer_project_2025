DOCKER_IMAGE := summer_project_2025
DOCKER_CONTAINER := summer_project_2025
GO_MODULE   := github.com/TailerDerdan/summer_project_2025/websocket
PORT        := 80

.PHONY:
.SILENT:

build:
	@echo "🔨 Собираем бинарник..."
	go build -o bin/app ./cmd/app/main.go

run: build
	@echo "🚀 Запускаем сервер на порту $(PORT)..."
	./bin/app

docker-build:
	@echo "⚙️ 🐳 Собираем Docker-образ..."
	docker build -t $(DOCKER_IMAGE) .

docker-run:
	@echo "✅ 🐳 Запускаем контейнер на порту $(PORT)..."
	docker run --name $(DOCKER_CONTAINER) -p $(PORT):$(PORT) $(DOCKER_IMAGE)

docker-stop:
	@echo "❎ 🐳 Останавливаем контейнер на порту $(PORT)..."
	docker stop $(DOCKER_CONTAINER)

docker-rm:
	@echo "🗑️ 🐳 Удаляем контейнер..."
	docker rm $(DOCKER_CONTAINER)