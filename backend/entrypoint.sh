#!/bin/bash
set -e

# Функция для проверки подключения через Doctrine
check_db_connection() {
    php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1
    return $?
}

# Ожидание базы данных (до 60 секунд)
MAX_RETRIES=60
RETRY_INTERVAL=1
retry_count=0

echo "Checking database connection..."
while ! check_db_connection; do
    if [ $retry_count -ge $MAX_RETRIES ]; then
        echo "❌ Database connection timeout after $MAX_RETRIES seconds!" >&2
        exit 1
    fi
    echo "⌛ Waiting for database... (attempt $((retry_count + 1))/$MAX_RETRIES"
    sleep $RETRY_INTERVAL
    ((retry_count++))
done

echo "✅ Database connection established"

# Проверка существования базы данных
echo "Checking database existence..."
php bin/console doctrine:database:create --if-not-exists

# Проверка и применение миграций
echo "Checking migrations status..."
if ! php bin/console doctrine:migrations:up-to-date >/dev/null 2>&1; then
    echo "🔁 Database migrations are not up to date"
    php bin/console doctrine:migrations:migrate --no-interaction
    echo "✅ Migrations applied successfully"

    # При необходимости можно добавить загрузку фикстур
    # php bin/console doctrine:fixtures:load --no-interaction
else
    echo "✅ Database is already up to date"
fi

# Проверка валидности схемы
echo "Validating database schema..."
php bin/console doctrine:schema:validate



exec "$@"
