# Use ServerSideUp's production-ready PHP images optimized for Laravel
# https://serversideup.net/open-source/docker-php/
FROM serversideup/php:8.2-fpm-nginx AS base

# Install Node.js for building assets
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www/html

# Copy dependency files
COPY composer.json composer.lock package.json package-lock.json ./

# Install PHP and Node dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction \
    && npm ci

# Copy application code
COPY . .

# Make release script executable
RUN chmod +x release.sh

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# Build frontend assets (Wayfinder will use existing generated files)
RUN npm run build && npm run build:ssr

# Set proper ownership
RUN chown -R www-data:www-data /var/www/html

# Switch back to www-data user
USER www-data

# Set Laravel-specific environment variables
ENV SSL_MODE=off \
    PHP_OPCACHE_ENABLE=1 \
    PHP_FPM_POOL_NAME=www \
    LOG_OUTPUT_LEVEL=warn

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/up || exit 1
