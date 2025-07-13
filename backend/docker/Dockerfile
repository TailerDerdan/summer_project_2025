FROM php:8.1-fpm-alpine

RUN docker-php-ext-install pdo pdo_mysql

COPY --from=composer /usr/bin/composer /usr/bin/composer

COPY ./composer.* ./

#RUN composer install --prefer-dist --no-dev --no-scripts --no-progress --no-interaction

COPY ./ .

RUN composer dump-autoload --optimize
