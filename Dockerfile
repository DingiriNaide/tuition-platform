FROM php:8.4-cli

# ── System deps + PHP extensions ────────────────────────────
RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev \
    unzip git curl ca-certificates gnupg \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip gd

# ── Node.js 20 (via NodeSource, since this is Debian not Alpine) ──
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# ── Composer ─────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ── PHP deps first — Wayfinder needs vendor/artisan to exist ──
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# ── Copy full app source ────────────────────────────────────
COPY . .

RUN composer dump-autoload --optimize

# ── App key needed for artisan to boot during the Vite build ──
# Wayfinder's generator boots the framework, which requires a valid APP_KEY.
# Render's real APP_KEY env var is injected at runtime, but the build stage
# needs *a* key present to avoid boot failure — a throwaway one is fine here
# since it only affects route introspection, not encryption of real data.
RUN php artisan key:generate --force || true

# ── Now Node deps + build — php is on PATH, vendor/ exists ──
COPY package*.json ./
RUN npm ci
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER
ENV VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY
ENV VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER
RUN npm run build

EXPOSE 10000

CMD php artisan migrate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}