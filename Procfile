# Procfile for Dokku
# This file is optional since we're using supervisord in the container
# but can be useful for reference or alternative deployment strategies

web: /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
release: php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache
