# Use ServerSideUp's production-ready PHP images optimized for Laravel
# https://serversideup.net/open-source/docker-php/
FROM serversideup/php:8.2-cli AS build

# Install Node.js for frontend build
USER root
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /var/www/html

# Copy dependency files
COPY composer.json composer.lock package.json package-lock.json ./

# Install dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction \
    && npm ci --only=production=false

# Copy application code
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# Build frontend assets
RUN npm run build && npm run build:ssr

# Production stage
FROM serversideup/php:8.2-fpm-nginx

# Copy application from build stage
COPY --chown=www-data:www-data --from=build /var/www/html /var/www/html

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
