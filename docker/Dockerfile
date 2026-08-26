# ===== Etapa 1: dependencias de Composer =====
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-dev --no-scripts --no-autoloader --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --no-dev

# ===== Etapa 2: build del frontend (Vite + React) =====
# Base con PHP (no node-alpine puro) porque @laravel/vite-plugin-wayfinder
# corre `php artisan wayfinder:generate` como parte de `npm run build` — el
# build del frontend no es un paso solo-de-Node en este proyecto.
FROM php:8.4-cli AS frontend

RUN apt-get update && apt-get install -y curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=vendor /app/vendor ./vendor

RUN npm run build

# ===== Etapa 3: imagen final de producción (PHP-FPM) =====
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git unzip zip rsync libfcgi-bin libpng-dev libjpeg-dev libfreetype6-dev libonig-dev libxml2-dev libzip-dev curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl gd bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Código de la app + vendor ya resuelto (sin repetir composer install aquí)
COPY . .
COPY --from=vendor /app/vendor ./vendor

# El build de Vite NO se copia directo a public/build: ese path es un bind
# mount hacia el host (ver docker-compose.prod.yml), leído por el Caddy del
# VPS directamente del filesystem. Por eso se deja en una ruta propia dentro
# de la imagen y entrypoint.sh la sincroniza en cada arranque — si se copiara
# directo a public/build, el bind mount del host la taparía y Caddy seguiría
# sirviendo el build viejo.
COPY --from=frontend /app/public/build /var/www/public-build

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Configurar PHP-FPM para escuchar en 0.0.0.0:9000 (accesible desde Caddy en el host)
# y habilitar ping.path para poder healthcheckear el pool por FastCGI.
RUN sed -i \
    -e 's/^;listen = .*/listen = 0.0.0.0:9000/' \
    -e 's/^;pm.status_path = .*/pm.status_path = \/status/' \
    -e 's/^;ping.path = .*/ping.path = \/ping/' \
    /usr/local/etc/php-fpm.d/www.conf && \
    echo "clear_env = no" >> /usr/local/etc/php-fpm.d/www.conf

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=5 \
    CMD SCRIPT_NAME=/ping SCRIPT_FILENAME=/ping REQUEST_METHOD=GET \
        cgi-fcgi -bind -connect 127.0.0.1:9000 | grep -q pong || exit 1

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
