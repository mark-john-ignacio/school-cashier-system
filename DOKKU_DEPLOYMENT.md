# 🐳 Deploying to Dokku with Docker

This guide covers deploying the School Cashier System to a Dokku server using Docker containers.

## 📋 Prerequisites

### On Your Dokku Server (128.199.221.34)

- Dokku 0.30+ installed
- Docker support enabled
- MySQL or PostgreSQL plugin installed
- SSL support (Let's Encrypt plugin)
- At least 2GB RAM recommended

### On Your Local Machine (Windows)

- Git installed
- SSH access configured with your deploy key
- Your SSH command: `ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34`

---

## 🚀 Quick Deployment Steps

### 1. Create the Dokku App (One-Time Setup)

SSH into your Dokku server and create the app:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 apps:create school-cashier
```

### 2. Configure Database

You have two options:

#### Option A: Use Existing Supabase PostgreSQL (Recommended for your setup)

Since you're already using Supabase, just set the database credentials as environment variables:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_CONNECTION=pgsql
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_PORT=5432
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_DATABASE=postgres
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_USERNAME=postgres.iomefzscfmoqmapdfrvt
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_PASSWORD=7gPNtFXos8ZVpyYD
```

**Benefits:**

- No need to manage database on Dokku server
- Supabase handles backups, scaling, and monitoring
- Same database for development and production (if desired)
- Built-in connection pooling

**Important:** Make sure your Supabase project allows connections from your Dokku server IP (128.199.221.34)

#### Option B: Create Local Database on Dokku

If you prefer a database on the same server:

```powershell
# For MySQL
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 mysql:create school-cashier-db
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 mysql:link school-cashier-db school-cashier

# For PostgreSQL
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 postgres:create school-cashier-db
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 postgres:link school-cashier-db school-cashier
```

### 3. Set Environment Variables

You can set all environment variables at once or individually. Here's a complete setup using your Supabase database:

```powershell
# Set all essential environment variables in one command
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier \
  APP_ENV=production \
  APP_DEBUG=false \
  APP_KEY=base64:R9s7m7tStGvzVneD3DPaJdn7t7dTml21uCE5x3VTwKk= \
  APP_URL=https://school-cashier.yourdomain.com \
  DB_CONNECTION=pgsql \
  DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com \
  DB_PORT=5432 \
  DB_DATABASE=postgres \
  DB_USERNAME=postgres.iomefzscfmoqmapdfrvt \
  DB_PASSWORD=<your-password>\
  SESSION_DRIVER=database \
  CACHE_STORE=database \
  QUEUE_CONNECTION=database \
  INERTIA_SSR_ENABLED=true \
  INERTIA_SSR_URL=http://127.0.0.1:13714 \
  LOG_CHANNEL=stack \
  LOG_LEVEL=error
```

**Or set them individually:**

```powershell
# Application
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier APP_ENV=production
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier APP_DEBUG=false
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier APP_KEY=base64:R9s7m7tStGvzVneD3DPaJdn7t7dTml21uCE5x3VTwKk=
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier APP_URL=https://school-cashier.yourdomain.com

# Supabase PostgreSQL Database
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_CONNECTION=pgsql
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_PORT=5432
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_DATABASE=postgres
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_USERNAME=postgres.iomefzscfmoqmapdfrvt
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_PASSWORD=7gPNtFXos8ZVpyYD

# Session, cache, and queue
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier SESSION_DRIVER=database
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier CACHE_STORE=database
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier QUEUE_CONNECTION=database

# Inertia SSR
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier INERTIA_SSR_ENABLED=true
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier INERTIA_SSR_URL=http://127.0.0.1:13714

# Logging
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier LOG_CHANNEL=stack
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier LOG_LEVEL=error
```

**Important Notes:**

- Change `APP_URL` to your actual domain
- For production, generate a new `APP_KEY`: `php artisan key:generate --show`
- Verify your Supabase firewall allows connections from 128.199.221.34

### 4. Set Up Git Remote

Add Dokku as a git remote in your local project:

```powershell
git remote add dokku dokku@128.199.221.34:school-cashier
```

Verify it was added:

```powershell
git remote -v
```

### 5. Configure SSH for Git Push

Since you're using a custom SSH key, create or edit `~/.ssh/config` (in Windows: `C:\Users\Mark\.ssh\config`):

```
Host 128.199.221.34
    HostName 128.199.221.34
    User dokku
    IdentityFile C:/Users/Mark/.ssh/do_deploy_key
    IdentitiesOnly yes
```

Test the connection:

```powershell
ssh -T dokku@128.199.221.34
```

### 6. Deploy Your Application

Push your code to Dokku (this will trigger the build):

```powershell
git push dokku master
```

Or if you're on a different branch:

```powershell
git push dokku main:master
```

Watch the deployment progress. Dokku will:

1. Build the Docker image using your Dockerfile
2. Run the frontend build (Vite + SSR)
3. Install PHP dependencies
4. Deploy the container
5. Run migrations (via release command in Procfile)

### 7. Run Initial Database Setup

After first deployment, seed the database:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan db:seed
```

Or use the demo refresh command:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan demo:refresh --force
```

### 8. Set Up SSL Certificate

Enable Let's Encrypt for HTTPS:

```powershell
# Set your email for Let's Encrypt notifications
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 letsencrypt:set school-cashier email your-email@example.com

# Enable auto-renewal
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 letsencrypt:cron-job --add
```

### 9. Configure Domain (Optional)

If you have a custom domain:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 domains:add school-cashier school-cashier.yourdomain.com
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 letsencrypt:enable school-cashier
```

---

## 🔄 Subsequent Deployments

After initial setup, deploying updates is simple:

```powershell
# Make your changes, commit them
git add .
git commit -m "Your commit message"

# Push to Dokku
git push dokku master
```

The deployment will automatically:

- Build new Docker image
- Run database migrations
- Cache config/routes/views
- Restart the application with zero downtime

---

## �️ Using Supabase PostgreSQL

### Firewall Configuration

Your Supabase database needs to allow connections from your Dokku server:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection Pooling** or **Network Restrictions**
4. Add your Dokku server IP: `128.199.221.34`

### Connection Pooling

You're already using Supabase's connection pooler:

- Host: `aws-1-ap-southeast-1.pooler.supabase.com`
- This is optimal for serverless/container deployments
- Handles connection management automatically

### Database Migrations

Since you're sharing the database, be careful with migrations:

```powershell
# Check current migration status
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan migrate:status

# Run migrations (already done in release command)
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan migrate --force
```

### Separate Databases for Dev/Production (Recommended)

Consider creating separate Supabase databases or schemas:

**Option 1: Different Supabase Projects**

- Development: Current database
- Production: New Supabase project with different credentials

**Option 2: Schema Separation** (PostgreSQL)

```sql
-- In Supabase SQL Editor
CREATE SCHEMA production;
CREATE SCHEMA development;
```

Then update `.env` for production:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier DB_SCHEMA=production
```

### Backup Strategy

Supabase automatically backs up your database:

- **Point-in-time recovery** available on paid plans
- **Daily backups** on free tier
- Access backups from Supabase dashboard

You can also create manual backups:

```powershell
# Export from production
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan db:backup

# Or use pg_dump directly (requires postgres client)
PGPASSWORD=7gPNtFXos8ZVpyYD pg_dump -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres > backup.sql
```

### Monitor Database Performance

Supabase provides built-in monitoring:

- Dashboard → **Database** → **Performance**
- View slow queries, connection count, resource usage
- Set up alerts for high usage

---

## �🛠️ Useful Dokku Commands

### Check App Status

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 ps:report school-cashier
```

### View Logs

```powershell
# View recent logs
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 logs school-cashier

# Follow logs in real-time
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 logs school-cashier -t
```

### Run Artisan Commands

```powershell
# General format
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan <command>

# Examples
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan migrate
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan cache:clear
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan queue:work
```

### Access Database

Since you're using Supabase, you can access it multiple ways:

**Option 1: Supabase Dashboard**

- Go to your Supabase project
- Navigate to **Table Editor** or **SQL Editor**

**Option 2: From Dokku Container**

```powershell
# Connect to PostgreSQL from within the app container
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan tinker
```

**Option 3: Direct psql Connection** (from your local machine)

```powershell
# Install PostgreSQL client if not already installed
# Then connect:
$env:PGPASSWORD="7gPNtFXos8ZVpyYD"
psql -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres -p 5432
```

**Option 4: Using Dokku run**

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan db
```

### Restart Application

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 ps:restart school-cashier
```

### Scale Workers (if needed)

```powershell
# Add more queue workers
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 ps:scale school-cashier web=1
```

### Check Environment Variables

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:show school-cashier
```

### Update Environment Variable

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier KEY=value
```

### Backup Database

Since you're using Supabase, backups are handled automatically. For manual exports:

**From Supabase Dashboard:**

1. Go to **Database** → **Backups**
2. Download manual backup or restore from point-in-time

**Using pg_dump (local machine):**

```powershell
# Set password as environment variable
$env:PGPASSWORD="7gPNtFXos8ZVpyYD"

# Export entire database
pg_dump -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres -F c -b -v -f backup.dump

# Or export as SQL
pg_dump -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres > backup.sql
```

**From Dokku (if pg_dump is available):**

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier pg_dump -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres > backup.sql
```

### Restore Database

**Using Supabase Dashboard:**

- Use point-in-time recovery or backup restore feature

**Using psql:**

```powershell
# Restore from SQL dump
$env:PGPASSWORD="7gPNtFXos8ZVpyYD"
psql -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres -f backup.sql

# Restore from custom dump
pg_restore -h aws-1-ap-southeast-1.pooler.supabase.com -U postgres.iomefzscfmoqmapdfrvt -d postgres backup.dump
```

---

## 📊 Monitoring and Maintenance

### Set Up Health Checks

Dokku will automatically use the `/up` endpoint defined in `nginx.conf` for health checks.

### Enable Zero-Downtime Deployments

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 checks:enable school-cashier
```

### Configure Resource Limits

```powershell
# Set memory limit (e.g., 1GB)
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 docker-options:add school-cashier deploy "--memory=1g"

# Set CPU limit
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 docker-options:add school-cashier deploy "--cpus=1"
```

---

## 🐛 Troubleshooting

### Build Fails During npm Install

If the build fails during frontend build, check that you have enough memory:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 docker-options:add school-cashier build "--memory=2g"
```

### Database Connection Issues

**Verify Supabase credentials:**

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:show school-cashier | grep DB_
```

**Test connection from Dokku:**

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan tinker

# In tinker, run:
# DB::connection()->getPdo();
# If successful, you'll see: PDO object
```

**Check Supabase firewall:**

1. Verify 128.199.221.34 is in allowed IPs
2. Check connection pooler is enabled
3. Verify credentials are correct

**Common issues:**

- Firewall blocking Dokku server IP
- Wrong database credentials
- Connection pooler URL vs direct connection URL
- SSL mode requirements (try adding `?sslmode=require` to connection string)

### Permission Errors

If you get permission errors with storage:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier chmod -R 775 storage bootstrap/cache
```

### SSR Not Working

Check if SSR server is running:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 logs school-cashier | grep inertia-ssr
```

Verify SSR was built:

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier ls -la bootstrap/ssr/
```

### Clear All Caches

```powershell
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 run school-cashier php artisan optimize:clear
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong APP_KEY** - Generate with `php artisan key:generate`
3. **Set APP_DEBUG=false** in production
4. **Use HTTPS** - Enable Let's Encrypt SSL
5. **Restrict database access** - Already handled by Dokku linking
6. **Regular backups** - Set up automated database backups
7. **Update dependencies** - Keep Laravel, PHP, and npm packages updated
8. **Monitor logs** - Check logs regularly for security issues

---

## 📈 Performance Optimization

### Enable OPcache

Already configured in the Dockerfile with optimized settings.

### Use Redis for Cache and Sessions (Optional)

If you want better performance:

```powershell
# Install Redis plugin
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 plugin:install https://github.com/dokku/dokku-redis.git redis

# Create and link Redis
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 redis:create school-cashier-redis
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 redis:link school-cashier-redis school-cashier

# Update config
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier CACHE_STORE=redis
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier SESSION_DRIVER=redis
ssh -i C:/Users/Mark/.ssh/do_deploy_key dokku@128.199.221.34 config:set school-cashier QUEUE_CONNECTION=redis
```

### Enable Gzip Compression

Already configured in `nginx.conf`.

---

## 📦 Container Information

Your Docker container includes:

- **PHP 8.2-FPM** - Main application runtime
- **Nginx** - Web server on port 5000
- **Node.js 20** - For Inertia SSR server
- **Supervisor** - Process manager for:
    - PHP-FPM
    - Nginx
    - Queue workers (2 processes)
    - Inertia SSR server

All services start automatically and restart on failure.

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test the application at your domain
2. ✅ Log in with demo accounts
3. ✅ Set up automated database backups
4. ✅ Configure monitoring/alerting
5. ✅ Set up CI/CD pipeline (optional)
6. ✅ Configure custom domain and SSL
7. ✅ Review security settings
8. ✅ Set up scheduled tasks (cron)

---

## 📞 Support

For Dokku-specific issues:

- [Dokku Documentation](http://dokku.viewdocs.io/dokku/)
- [Dokku GitHub Issues](https://github.com/dokku/dokku/issues)

For application issues:

- Check application logs: `dokku logs school-cashier`
- Review Laravel logs: `dokku run school-cashier cat storage/logs/laravel.log`

---

**Your School Cashier System is now running on Dokku! 🎉**
