#!/bin/bash
set -e

# Функция для проверки подключения через Doctrine
check_db_connection() {
    php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1
    return $?
}

# Ожидание базы данных (до 30 секунд)
timeout=30
while ! check_db_connection; do
    if [ "$timeout" -le 0 ]; then
        echo "Database connection timeout!" >&2
        exit 1
    fi
    echo "Waiting for database... ($timeout seconds left)"
    sleep 1
    ((timeout--))
done

# Проверка и применение миграций
if ! php bin/console doctrine:migrations:up-to-date >/dev/null 2>&1; then
    echo "Database migrations are not up to date"
    php bin/console doctrine:migrations:migrate --no-interaction
    echo "Migrations applied successfully"
else
    echo "Database is already up to date"
fi

exec "$@"
