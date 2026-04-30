FROM php:8.2-apache

# Dependencias del sistema y extensiones necesarias para Symfony + MySQL
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql intl zip

# Habilitar mod_rewrite y asegurar que solo haya un MPM activo (prefork)
RUN a2enmod rewrite && \
    a2dismod mpm_event mpm_worker || true && \
    a2enmod mpm_prefork

# Configurar DocumentRoot a la carpeta public de Symfony
ENV APACHE_DOCUMENT_ROOT /var/www/symfony/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN echo "<Directory /var/www/symfony/public>\n    AllowOverride All\n    FallbackResource /index.php\n    SetEnvIf Authorization \"(.*)\" HTTP_AUTHORIZATION=\$1\n</Directory>" > /etc/apache2/conf-available/symfony.conf && a2enconf symfony

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

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

# Entorno de producción
ENV APP_ENV=prod
ENV APP_SECRET=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4

# Generar claves JWT si no existen (las del repo se copian con COPY backend/)
RUN mkdir -p config/jwt && \
    if [ ! -f config/jwt/private.pem ]; then \
        openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:b59c885b5f7b5dad0c9c1363ea04742b3cd8f7b95a5aec4899c5565b79c3ce6a; \
        openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:b59c885b5f7b5dad0c9c1363ea04742b3cd8f7b95a5aec4899c5565b79c3ce6a; \
    fi && \
    chmod 644 config/jwt/private.pem config/jwt/public.pem

# Autoload optimizado + cache de producción
RUN mkdir -p var/cache var/log && \
    composer dump-autoload --optimize --classmap-authoritative && \
    php bin/console cache:clear --env=prod --no-warmup && \
    php bin/console cache:warmup --env=prod

# Permisos para Apache
RUN chown -R www-data:www-data /var/www/symfony/var /var/www/symfony/config/jwt

# Script de inicio para configurar el puerto dinámico de Railway
RUN echo '#!/bin/bash\n\
PORT=${PORT:-8080}\n\
sed -i "s/80/$PORT/g" /etc/apache2/ports.conf\n\
sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf\n\
a2dismod mpm_event mpm_worker || true\n\
a2enmod mpm_prefork || true\n\
exec apache2-foreground' > /start.sh && chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
