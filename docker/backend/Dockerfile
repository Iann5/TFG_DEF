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
RUN echo "<Directory /var/www/symfony/public>\n    AllowOverride All\n    FallbackResource /index.php\n</Directory>" > /etc/apache2/conf-available/symfony.conf && a2enconf symfony

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

# Permisos para Apache
RUN chown -R www-data:www-data /var/www/symfony/var

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
