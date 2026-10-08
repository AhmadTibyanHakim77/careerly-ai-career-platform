#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY belum diatur. Ikuti langkah pembuatan kunci di README.md." >&2
    exit 1
fi

php artisan optimize:clear

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force
    php artisan db:seed --force
fi

php artisan optimize
exec "$@"
