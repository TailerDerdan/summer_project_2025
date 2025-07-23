# summer_project
Летняя практика

## Запускаем в терминале
### 1. Сборка проекта
    docker compose build
### 2. Запуск проекта
    docker compose up -d
### 3. Пересобрать контейнеры и сразу запустить
    docker compose up --build -d
### 4. Остановить и удалить контейнеры проекта
    docker compose down
### 5. Вывести список всех контейнеров
    docker compose ps -a
### 6. Удалить записи из БД
    docker compose down -v
### 7. Можно одной командой
    docker compose down && docker compose up -d && docker compose ps -a
### 8. Или с полной пересборкой 
    docker compose down && docker compose up --build -d ws &&
    docker compose up -d api, db, frontend, nginx

### 9. Удаление кэша сборки (build cache)
    docker builder prune 
    -a/--all - удалить ВЕСЬ кэш (включая неиспользуемый)
    -f/--force - без подтверждения

### 10. Удаление кэша образов (image cache)
    docker image prune
    -a - удалить все неиспользуемые образы (dangling и unreferenced)
    --filter - фильтр по тегам/времени
    