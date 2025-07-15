FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    zlib1g-dev \
    g++ \
    git \
    libicu-dev \
    libzip-dev \
    iputils-ping \
    dnsutils \
    net-tools \
    && docker-php-ext-install intl opcache pdo pdo_mysql \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN echo "listen = 9000" > /usr/local/etc/php-fpm.d/zz-docker.conf

WORKDIR /var/www/backend

COPY composer.json composer.lock symfony.lock ./

RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader
RUN composer dump-autoload

COPY . .
#
#RUN chown -R www-data:www-data var

#RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

CMD ["php-fpm", "-F"]
