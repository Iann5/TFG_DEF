FROM php:8.2-cli

# Dependencias del sistema y extensiones necesarias para Symfony + MySQL
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql intl zip

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/symfony

# Cache de capas de Composer
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-autoloader \
    --no-scripts

# Código de la app
COPY backend/ ./
RUN mkdir -p var/cache var/log && composer dump-autoload --optimize

EXPOSE 8080

# Evita Apache/MPM: servidor embebido PHP para Railway
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t public public/index.php"]
