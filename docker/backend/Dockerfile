FROM php:8.2-apache

# Instalamos dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalamos las extensiones de PHP requeridas por Symfony y la BD
RUN docker-php-ext-install pdo pdo_mysql intl zip

# Habilitamos el módulo rewrite de Apache (súper importante para que funcionen las rutas de Symfony)
RUN a2enmod rewrite

# Configuramos el DocumentRoot de Apache para que apunte a la carpeta "public" de Symfony
ENV APACHE_DOCUMENT_ROOT /var/www/symfony/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# VHost para Symfony: enruta todo a index.php (sin depender de .htaccess)
COPY docker/backend/000-default.conf /etc/apache2/sites-available/000-default.conf

# Instalamos Composer de forma global copiándolo desde la imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Establecemos el directorio de trabajo
WORKDIR /var/www/symfony
