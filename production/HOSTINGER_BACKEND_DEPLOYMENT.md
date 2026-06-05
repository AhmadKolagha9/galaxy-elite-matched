# Hostinger VPS Backend Deployment Guide

Target: Ubuntu VPS with Nginx already installed
App: Galaxy Elite Private Match backend
Backend path in repo: `backend/`
Runtime: Node.js 20+
Process manager: PM2
Reverse proxy: Nginx

## Production URLs

These are the selected Hostinger production domains for this deployment.

```bash
PRODUCTION_BACKEND_API_URL=https://api.yourpropertymatch.cloud
PRODUCTION_WEBSITE_URL=https://yourpropertymatch.cloud
PRODUCTION_ADMIN_DASHBOARD_URL=https://admin.yourpropertymatch.cloud
PRODUCTION_CORS_ORIGIN=https://yourpropertymatch.cloud,https://www.yourpropertymatch.cloud,https://admin.yourpropertymatch.cloud
```

Final mapping:

```text
Backend API: https://api.yourpropertymatch.cloud
Website: https://yourpropertymatch.cloud
Admin dashboard: https://admin.yourpropertymatch.cloud
```

## 1. Connect To VPS

From your local machine:

```bash
ssh root@YOUR_SERVER_IP
```

Create a deploy user:

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

## 2. Install Server Packages

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
```

Install Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Install PM2:

```bash
sudo npm install -g pm2
pm2 -v
```

## 3. Upload The Project

Recommended: use Git.

```bash
cd /var/www
sudo mkdir -p galaxy-elite-private-match-ultimate
sudo chown -R deploy:deploy galaxy-elite-private-match-ultimate
cd galaxy-elite-private-match-ultimate
git clone YOUR_REPOSITORY_URL .
```

Alternative from your local machine with `rsync`:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude dist ./ deploy@YOUR_SERVER_IP:/var/www/galaxy-elite-private-match-ultimate/
```

## 4. Create Backend Environment File

On the VPS:

```bash
cd /var/www/galaxy-elite-private-match-ultimate/backend
nano .env
```

Use this template and fill real values:

```bash
NODE_ENV=production
PORT=4000
API_NAME=Galaxy Elite Private Match API

MYSQL_DATABASE_URL=mysql://DB_USER:DB_PASSWORD@127.0.0.1:3306/DB_NAME
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@127.0.0.1:3306/DB_NAME

AUTH_JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
AUTH_JWT_EXPIRES_IN_SECONDS=28800
BCRYPT_SALT_ROUNDS=12

CORS_ORIGIN=
PRIVATE_DOCUMENT_BUCKET=private-documents
SIGNED_DOCUMENT_BASE_URL=

ENABLE_DEV_AUTH=false
INTERNAL_API_KEY=REPLACE_WITH_LONG_RANDOM_INTERNAL_KEY

FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=
FIREBASE_NOTIFICATION_TOPIC=

NOTIFICATION_WEBHOOK_SECRET=
EMAIL_FROM=Galaxy Elite <notifications@your-domain.com>
RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAILS=
```

Important:

- Do not commit `backend/.env`.
- `AUTH_JWT_SECRET` must be long and private.
- `CORS_ORIGIN` must be exact domains separated by commas, not `*`.
- For example later: `CORS_ORIGIN=https://your-domain.com,https://admin.your-domain.com`.

Generate secrets:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

## 5. Configure MySQL

If MySQL is on the same VPS:

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
sudo mysql
```

Inside MySQL:

```sql
CREATE DATABASE galaxy_elite_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'galaxy_prod'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON galaxy_elite_production.* TO 'galaxy_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then set:

```bash
MYSQL_DATABASE_URL=mysql://galaxy_prod:REPLACE_WITH_STRONG_PASSWORD@127.0.0.1:3306/galaxy_elite_production
DATABASE_URL=mysql://galaxy_prod:REPLACE_WITH_STRONG_PASSWORD@127.0.0.1:3306/galaxy_elite_production
```

## 6. Install Dependencies And Build Backend

```bash
cd /var/www/galaxy-elite-private-match-ultimate/backend
npm ci
npm run typecheck
npm run build
```

Run migrations:

```bash
npm run db:migrate
```

The migration runner applies SQL files from:

```text
backend/db/mysql/
```

## 7. Start Backend With PM2

```bash
cd /var/www/galaxy-elite-private-match-ultimate/backend
pm2 start dist/server.js --name galaxy-backend
pm2 save
pm2 startup
```

When `pm2 startup` prints a command, copy and run that command with `sudo`.

Check status:

```bash
pm2 status
pm2 logs galaxy-backend
curl http://127.0.0.1:4000/api/health
```

## 8. Configure Nginx Reverse Proxy

Create config:

```bash
sudo nano /etc/nginx/sites-available/galaxy-backend
```

Use this config, replacing the domain later:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/galaxy-backend /etc/nginx/sites-enabled/galaxy-backend
sudo nginx -t
sudo systemctl reload nginx
```

Test:

```bash
curl http://api.your-domain.com/api/health
```

If the domain is not ready yet, test by server IP:

```bash
curl http://YOUR_SERVER_IP/api/health
```

For IP-only testing, temporarily use:

```nginx
server_name _;
```

## 9. Add SSL With Certbot

Only do this after DNS points to the VPS.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

Test renewal:

```bash
sudo certbot renew --dry-run
```

## 10. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Do not expose MySQL publicly unless you have a specific secure reason.

## 11. Update Deployment

When code changes:

```bash
cd /var/www/galaxy-elite-private-match-ultimate
git pull
cd backend
npm ci
npm run typecheck
npm run build
npm run db:migrate
pm2 restart galaxy-backend
pm2 logs galaxy-backend
```

## 12. Required Production QA After Deploy

Run these on the VPS:

```bash
cd /var/www/galaxy-elite-private-match-ultimate
npm run typecheck:backend
npm run build:backend
```

From your local machine or VPS:

```bash
curl https://api.your-domain.com/api/health
```

Then update:

```text
qa-tester/05_FINAL_QA_PRODUCTION_READINESS_CHECKLIST.md
qa-tester/07_FINAL_QA_EXECUTION_REPORT.md
```

Production is not ready until:

- Real production URLs are filled.
- `CORS_ORIGIN` is set to exact website/admin dashboard domains.
- MySQL migrations pass.
- Backend health endpoint works through HTTPS.
- Admin/user browser QA is completed.
- Signed document upload/viewing QA is completed.
- Security/no-leak QA is completed.

## 13. Useful Commands

PM2:

```bash
pm2 status
pm2 logs galaxy-backend
pm2 restart galaxy-backend
pm2 stop galaxy-backend
```

Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx
```

Backend local health:

```bash
curl http://127.0.0.1:4000/api/health
```

Backend public health:

```bash
curl https://api.your-domain.com/api/health
```
