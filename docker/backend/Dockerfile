FROM php:8.2-apache

# Dependencias del sistema y extensiones necesarias para Symfony + MySQL
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql intl zip

# Habilitar mod_rewrite para Symfony
RUN a2enmod rewrite

# Configurar DocumentRoot a la carpeta public de Symfony
ENV APACHE_DOCUMENT_ROOT /var/www/symfony/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configurar Apache para que escuche en el puerto que Railway inyecta
RUN sed -i 's/80/${PORT:-8080}/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:${PORT:-8080}/g' /etc/apache2/sites-available/*.conf

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

EXPOSE 8080

CMD ["apache2-foreground"]
