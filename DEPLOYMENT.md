# Vizag Properties - Hostinger VPS Deployment Guide

This guide walks you through deploying Vizag Properties on a Hostinger VPS running Ubuntu.

## Prerequisites

- Hostinger VPS with Ubuntu 22.04 or 24.04
- Root or sudo access
- Domain `vizag.properties` pointed to your VPS IP (A record)
- Node.js 20 LTS installed
- PostgreSQL 14+ installed and running

---

## 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## 2. PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# In psql:
CREATE DATABASE app_db;
CREATE USER postgres_app WITH PASSWORD 'CHANGE_THIS_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE app_db TO postgres_app;
\q
```

Update your `.env` file with:

```
DATABASE_URL=postgresql://postgres_app:CHANGE_THIS_STRONG_PASSWORD@127.0.0.1:5432/app_db
AUTH_SECRET=generate-a-random-64-char-string-here

# Image uploads (Cloudinary - see section 3.1)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_FOLDER=vizag-properties
UPLOAD_PROVIDER=cloudinary
```

## 3. Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/vizag-properties
sudo chown -R $USER:$USER /var/www/vizag-properties

# Clone your repository (or upload files)
cd /var/www/vizag-properties
# git clone https://github.com/your-repo/vizag-properties.git .

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env  # Fill in DATABASE_URL, AUTH_SECRET and the CLOUDINARY_* values

# Build the application
npm run build

# Apply database schema (additive migration - no data is dropped)
npm run db:migrate

# The app auto-seeds on first /api/health hit
```

> **Migration note:** `npm run db:migrate` applies the SQL files in `drizzle/`
> (including `0001_self_service_listing.sql`, which ADDs the new moderation and
> account-type columns and back-fills existing rows as approved builders).
> `npx drizzle-kit push` still works if you prefer pushing the schema directly,
> but prefer the migration so the `__drizzle_migrations` history stays accurate.
>
> Drizzle reads its connection string from the environment (`drizzle.config.ts`),
> so make sure `.env` is filled in BEFORE running any db command.

### 3.1 Cloudinary setup (property photo uploads)

1. Create a free account at https://cloudinary.com
2. Dashboard → **Product Environment Credentials** → copy Cloud name, API Key, API Secret
3. Put them in `.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. (Optional) change `CLOUDINARY_UPLOAD_FOLDER` to organise assets

Uploads are **signed server-side** in `/api/uploads/property-images`: the API
secret never leaves the VPS and is never exposed to the browser. Nothing is
written to the app filesystem.

> **Local development without Cloudinary:** set
> `UPLOAD_PROVIDER=local` **and** `ALLOW_LOCAL_UPLOADS=true`. This writes to
> `public/uploads` and is automatically refused when `NODE_ENV=production`.

## 4. PM2 Setup

Create `ecosystem.config.js` in the project root:

```js
module.exports = {
  apps: [{
    name: 'vizag-properties',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vizag-properties',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# (run the command it outputs)
```

## 5. Nginx Configuration

Create `/etc/nginx/sites-available/vizag.properties`:

```nginx
server {
    listen 80;
    server_name vizag.properties www.vizag.properties;

    # Redirect www to non-www
    return 301 https://vizag.properties$request_uri;
}

server {
    listen 80;
    server_name www.vizag.properties;
    return 301 https://vizag.properties$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name vizag.properties;

    # SSL certificates (set up by certbot)
    ssl_certificate /etc/letsencrypt/live/vizag.properties/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vizag.properties/privkey.pem;

    # SSL optimizations
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Next.js static files
    location /_next/static/ {
        alias /var/www/vizag-properties/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public files
    location /public/ {
        alias /var/www/vizag-properties/public/;
        expires 30d;
        access_log off;
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # File upload limit (for image uploads in future)
    client_max_body_size 20M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/vizag.properties /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d vizag.properties -d www.vizag.properties
```

Follow the prompts. Certbot will automatically configure Nginx for HTTPS and set up auto-renewal.

## 7. Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 8. Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check app logs
pm2 logs vizag-properties

# Test endpoints
curl https://vizag.properties/api/health
```

## 9. Useful Commands

```bash
# View logs
pm2 logs vizag-properties

# Restart app
pm2 restart vizag-properties

# Update app
cd /var/www/vizag-properties
git pull  # or upload new files
npm install
npm run build
npm run db:migrate  # if schema changed
pm2 restart vizag-properties

# Backup database
pg_dump -U postgres_app app_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres_app app_db < backup_file.sql
```

## 10. Default Login Credentials

After first deployment, the app auto-seeds. Use these credentials:

**Admin Login:**
- Email: `admin@vizag.properties`
- Password: `Admin@123`

**Builder Login (any builder / owner / agent account):**
- Email: `contact@sravanthi.com`
- Password: `Builder@123`

⚠️ **Important:** Change these immediately after first login.

**Public entry points added by the self-service listing feature:**
- `/list-your-property` – public "List Your Property" landing page
- `/register?type=builder|owner|agent` – self-service registration
- `/login` – seller login (builders, owners and agents)
- `/dashboard/seller/*` – the single seller dashboard (old `/dashboard/builder/*`
  URLs 308-redirect here and keep working)
- `/dashboard/admin/approvals` – moderation queue
- `/dashboard/admin/users` – accounts + verification toggles

### Recommended: `scripts/set-credentials.js`

This repo includes a script that hashes your new password with the same
bcrypt logic the app uses (`src/lib/auth.ts`) and updates the row directly
in Postgres/Neon. Credentials are passed as environment variables so
nothing sensitive is ever committed to git.

```bash
# See current admin/builder emails
node scripts/set-credentials.js --list

# Update the admin login
ADMIN_EMAIL="you@yourdomain.com" \
ADMIN_PASSWORD="YourNewStrongPassword!23" \
node scripts/set-credentials.js --admin

# Update a builder login (BUILDER_CURRENT_EMAIL must match an existing row)
BUILDER_CURRENT_EMAIL="contact@sravanthi.com" \
BUILDER_EMAIL="you@yourdomain.com" \
BUILDER_PASSWORD="YourNewStrongPassword!23" \
node scripts/set-credentials.js --builder
```

### Manual alternative: raw SQL

If you'd rather do it by hand, generate a bcrypt hash and run the `UPDATE`
yourself:

```bash
# Generate a bcrypt hash for your new password (10 salt rounds, matches src/lib/auth.ts)
node -e "console.log(require('bcryptjs').hashSync('YourNewStrongPassword!23', 10))"
```

```sql
-- Admin (email is unique — this changes both email and password in one row)
UPDATE admins
SET email = 'you@yourdomain.com', password_hash = 'PASTE_THE_HASH_HERE'
WHERE email = 'admin@vizag.properties';

-- Builder (identify the row by its current email)
UPDATE builders
SET email = 'you@yourdomain.com', password_hash = 'PASTE_THE_HASH_HERE'
WHERE email = 'contact@sravanthi.com';
```

## Architecture

- **Frontend:** Next.js 15 App Router, Server Components
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** JWT-based sessions (jose) + bcrypt password hashing
- **Process Manager:** PM2
- **Web Server:** Nginx (reverse proxy + SSL termination)
- **SSL:** Let's Encrypt (auto-renewal)

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL
- React Hook Form + Zod
- Framer Motion
- Lucide Icons
- Leaflet Maps (OpenStreetMap)

## Support

For issues, check logs first:
- `pm2 logs vizag-properties`
- `sudo tail -f /var/log/nginx/error.log`
