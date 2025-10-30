# Multi-stage Dockerfile for Laravel + Inertia.js SSR
# Optimized for Dokku deployment with PHP 8.2, Node.js 20, and Nginx

# ==============================================================================
# Stage 1: PHP Dependencies First (needed for Wayfinder)
# ==============================================================================
FROM composer:2 AS composer-base

WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies (production only, optimized)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction \
    --ignore-platform-reqs

# Copy app source
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# ==============================================================================
# Stage 2: Frontend Build (Node.js with minimal PHP for Wayfinder)
# ==============================================================================
FROM php:8.2-cli-alpine AS frontend

WORKDIR /app

# Install Node.js and minimal PHP extensions (only what Wayfinder needs)
RUN apk add --no-cache \
    nodejs \
    npm \
    libzip-dev \
    sqlite-dev \
    && docker-php-ext-install \
    pdo_sqlite \
    zip

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm ci --only=production=false

# Copy necessary files for Wayfinder to work
COPY --from=composer-base /app/vendor ./vendor
COPY artisan ./
COPY config ./config
COPY routes ./routes
COPY app ./app
COPY bootstrap ./bootstrap
COPY database ./database
COPY storage ./storage

# Create minimal .env for artisan to work
RUN echo "APP_KEY=base64:R9s7m7tStGvzVneD3DPaJdn7t7dTml21uCE5x3VTwKk=" > .env \
    && echo "APP_ENV=production" >> .env \
    && echo "DB_CONNECTION=sqlite" >> .env \
    && mkdir -p database \
    && touch database/database.sqlite

# Copy frontend source
COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json components.json ./

# Build assets (CSR + SSR) - Wayfinder can now call php artisan
RUN npm run build && npm run build:ssr

# ==============================================================================
# Stage 3: Production Runtime (PHP + Nginx)
# ==============================================================================
FROM php:8.2-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    icu-dev \
    sqlite \
    sqlite-dev \
    postgresql-dev \
    mysql-client \
    nodejs \
    npm \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    mbstring \
    xml \
    bcmath \
    pcntl \
    zip \
    intl \
    opcache \
    && apk del --no-cache ${BUILD_DEPS}

# Configure PHP for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && echo "opcache.enable=1" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "opcache.memory_consumption=256" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "opcache.interned_strings_buffer=16" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "opcache.max_accelerated_files=10000" >> "$PHP_INI_DIR/conf.d/opcache.ini" \
    && echo "opcache.validate_timestamps=0" >> "$PHP_INI_DIR/conf.d/opcache.ini"

WORKDIR /app

# Copy application files from build stages
COPY --from=composer-base /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build
COPY --from=frontend /app/bootstrap/ssr ./bootstrap/ssr
COPY . .

# Set permissions
RUN chown -R www-data:www-data /app \
    && chmod -R 755 /app \
    && chmod -R 775 /app/storage \
    && chmod -R 775 /app/bootstrap/cache

# Create nginx and supervisor directories
RUN mkdir -p /var/log/nginx \
    && mkdir -p /var/log/supervisor \
    && mkdir -p /run/nginx

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port for Dokku
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/up || exit 1

# Start supervisor to manage nginx, php-fpm, queue, and SSR
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
