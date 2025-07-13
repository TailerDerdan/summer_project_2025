FROM php:8.2-fpm

# Установка зависимостей
RUN apt-get update && apt-get install -y zlib1g-dev g++ git libicu-dev zip libzip-dev zip \
    && docker-php-ext-install intl opcache pdo pdo_mysql \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

# Установка Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN echo "listen = 9000" > /usr/local/etc/php-fpm.d/zz-docker.conf

# Рабочая директория
WORKDIR /var/www/backend

# Копирование файлов composer
COPY composer.json composer.lock symfony.lock ./

# Установка зависимостей
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader

# Копирование остальных файлов
COPY . .

# Опционально: права для кеша
RUN chown -R www-data:www-data var
