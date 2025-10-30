# 🚀 Quick Deploy to Dokku with Supabase

Fast deployment guide for School Cashier System using your existing Supabase PostgreSQL database.

## ⚡ One-Time Setup (5 minutes)

### 1. Configure SSH

Add to `C:\Users\Mark\.ssh\config`:

```
Host 128.199.221.34
    HostName 128.199.221.34
    User dokku
    IdentityFile C:/Users/Mark/.ssh/do_deploy_key
    IdentitiesOnly yes
```

### 2. Create Dokku App

```powershell
ssh dokku@128.199.221.34 apps:create school-cashier
ssh dokku@128.199.221.34 builder:set school-cashier selected dockerfile
```

### 3. Set Environment Variables (All at Once)

```powershell
ssh dokku@128.199.221.34 config:set school-cashier APP_NAME=SchoolCashierSystem APP_ENV=production APP_DEBUG=false APP_KEY=base64:R9s7m7tStGvzVneD3DPaJdn7t7dTml21uCE5x3VTwKk= APP_URL=https://school-cashier.markjohnignacio.tech DB_CONNECTION=pgsql DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com DB_PORT=5432 DB_DATABASE=postgres DB_USERNAME=postgres.iomefzscfmoqmapdfrvt DB_PASSWORD=<password> SESSION_DRIVER=database CACHE_STORE=database QUEUE_CONNECTION=database INERTIA_SSR_ENABLED=true INERTIA_SSR_URL=http://127.0.0.1:13714 LOG_CHANNEL=stack LOG_LEVEL=error
```

**Important Notes:**

- APP_NAME doesn't support spaces in PowerShell - using `SchoolCashierSystem` instead
- Replace the APP_URL with your actual domain
- All on one line to avoid PowerShell line continuation issues

### 4. Allow Dokku Server in Supabase

1. Go to your Supabase project dashboard
2. Settings → Database → Connection Pooling
3. Add IP: `128.199.221.34` to allowed connections

### 5. Add Git Remote

```powershell
git remote add dokku dokku@128.199.221.34:school-cashier
```

---

## 🚀 Deploy

```powershell
git push dokku master
```

That's it! Wait 3-5 minutes for:

- ✅ Docker image build
- ✅ Frontend assets compilation
- ✅ Composer dependencies installation
- ✅ Database migrations
- ✅ Cache optimization

---

## 🌱 Initialize Data

```powershell
# Seed demo data
ssh dokku@128.199.221.34 run school-cashier php artisan db:seed --force

# OR refresh with demo data
ssh dokku@128.199.221.34 run school-cashier php artisan demo:refresh --force
```

---

## 🔒 Set Up SSL (Let's Encrypt)

```powershell
# Add your domain
ssh dokku@128.199.221.34 domains:add school-cashier your-domain.com

# Set email for SSL notifications
ssh dokku@128.199.221.34 letsencrypt:set school-cashier email your-email@example.com

# Enable SSL
ssh dokku@128.199.221.34 letsencrypt:enable school-cashier

# Enable auto-renewal
ssh dokku@128.199.221.34 letsencrypt:cron-job --add
```

---

## 🔄 Update Deployment

```powershell
# Make changes, commit
git add .
git commit -m "Update message"

# Deploy
git push dokku master
```

---

## 📋 Useful Commands

### View Logs

```powershell
# Recent logs
ssh dokku@128.199.221.34 logs school-cashier

# Follow logs live
ssh dokku@128.199.221.34 logs school-cashier -t

# Filter for errors
ssh dokku@128.199.221.34 logs school-cashier | grep ERROR
```

### Run Artisan Commands

```powershell
# Template
ssh dokku@128.199.221.34 run school-cashier php artisan <command>

# Examples
ssh dokku@128.199.221.34 run school-cashier php artisan migrate:status
ssh dokku@128.199.221.34 run school-cashier php artisan cache:clear
ssh dokku@128.199.221.34 run school-cashier php artisan queue:work --once
ssh dokku@128.199.221.34 run school-cashier php artisan tinker
```

### Check Status

```powershell
# App status
ssh dokku@128.199.221.34 ps:report school-cashier

# Environment variables
ssh dokku@128.199.221.34 config:show school-cashier

# Scale info
ssh dokku@128.199.221.34 ps:scale school-cashier
```

### Restart App

```powershell
ssh dokku@128.199.221.34 ps:restart school-cashier
```

---

## 🗄️ Database Management

### Access Database

```powershell
# Via Laravel Tinker
ssh dokku@128.199.221.34 run school-cashier php artisan tinker

# Via artisan db
ssh dokku@128.199.221.34 run school-cashier php artisan db
```

### Run Migrations

```powershell
# Check status
ssh dokku@128.199.221.34 run school-cashier php artisan migrate:status

# Run migrations
ssh dokku@128.199.221.34 run school-cashier php artisan migrate --force

# Rollback
ssh dokku@128.199.221.34 run school-cashier php artisan migrate:rollback --force
```

### Backup (use Supabase dashboard)

Your Supabase database is automatically backed up. Access backups at:

- Supabase Dashboard → Database → Backups

---

## 🐛 Troubleshooting

### Build Fails (Out of Memory)

```powershell
ssh dokku@128.199.221.34 docker-options:add school-cashier build "--memory=2g"
```

### Can't Connect to Database

```powershell
# Verify credentials
ssh dokku@128.199.221.34 config:show school-cashier | grep DB_

# Test connection
ssh dokku@128.199.221.34 run school-cashier php artisan tinker
# Then run: DB::connection()->getPdo();
```

Check Supabase:

- Dashboard → Settings → Database
- Verify 128.199.221.34 is allowed
- Check connection pooler is enabled

### Permission Errors

```powershell
ssh dokku@128.199.221.34 run school-cashier chmod -R 775 storage bootstrap/cache
```

### Clear All Caches

```powershell
ssh dokku@128.199.221.34 run school-cashier php artisan optimize:clear
```

### SSR Not Working

```powershell
# Check SSR logs
ssh dokku@128.199.221.34 logs school-cashier | grep ssr

# Verify SSR was built
ssh dokku@128.199.221.34 run school-cashier ls -la bootstrap/ssr/
```

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at your domain
- [ ] SSL certificate is installed and working
- [ ] Can log in with demo accounts
- [ ] Database connection works
- [ ] Assets (CSS/JS) load properly
- [ ] Queue workers are running (check logs)
- [ ] SSR is working (check page source for pre-rendered HTML)
- [ ] Update APP_URL to match your domain
- [ ] Consider generating new APP_KEY for production

---

## 📊 Your Setup Summary

**Dokku Server:** 128.199.221.34  
**App Name:** school-cashier  
**Database:** Supabase PostgreSQL (aws-1-ap-southeast-1.pooler.supabase.com)  
**SSH Key:** C:/Users/Mark/.ssh/do_deploy_key  
**Git Remote:** dokku@128.199.221.34:school-cashier

**Services Running in Container:**

- ✅ Nginx (port 5000)
- ✅ PHP-FPM
- ✅ Queue Workers (2 processes)
- ✅ Inertia SSR Server (port 13714)

All managed by Supervisor for automatic restart on failure.

---

## 🎯 Next Steps

1. Set up your custom domain DNS records
2. Generate a new APP_KEY for production security
3. Configure mail settings for password resets
4. Set up monitoring (optional)
5. Review and update demo account passwords
6. Consider creating a separate production database in Supabase

---

**Happy Deploying! 🚀**

For detailed documentation, see `DOKKU_DEPLOYMENT.md`
