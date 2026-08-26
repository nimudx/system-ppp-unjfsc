#!/bin/bash
set -e

# El build del frontend viaja horneado en la imagen (ver docker/Dockerfile),
# pero public/ está montado desde el host para que Caddy lo sirva sin pasar
# por PHP-FPM. Sincronizarlo en cada arranque es lo que hace que un deploy
# nuevo (imagen nueva) también actualice lo que Caddy sirve.
echo "Sincronizando build del frontend..."
mkdir -p /var/www/public/build
rsync -a --delete /var/www/public-build/ /var/www/public/build/

echo "Refrescando cachés de Laravel (config, rutas, vistas)..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php-fpm
