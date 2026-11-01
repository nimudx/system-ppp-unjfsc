#!/bin/bash
set -e

# Queue containers use the same image, but must not sync public assets or
# rebuild shared view caches every time the worker restarts.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# El build del frontend viaja horneado en la imagen (ver docker/Dockerfile),
# pero public/ está montado desde el host para que Caddy lo sirva sin pasar
# por PHP-FPM. Sincronizarlo en cada arranque es lo que hace que un deploy
# nuevo (imagen nueva) también actualice lo que Caddy sirve.
echo "Sincronizando build del frontend..."
mkdir -p /var/www/public/build
rsync -a --delete /var/www/public-build/ /var/www/public/build/

# storage/ también es un bind mount del host (./storage-data). Si el host lo
# trae vacío (repo recién clonado), Docker lo crea como root y sin la
# estructura de Laravel, y `view:cache` falla con "View path not found".
echo "Preparando storage/..."
mkdir -p /var/www/storage/{app/public,framework/{cache/data,sessions,views},logs}
chown -R www-data:www-data /var/www/storage

echo "Refrescando cachés de Laravel (config, rutas, vistas)..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php-fpm
