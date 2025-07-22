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
    docker compose down && docker compose up --build -d && docker compose ps -a